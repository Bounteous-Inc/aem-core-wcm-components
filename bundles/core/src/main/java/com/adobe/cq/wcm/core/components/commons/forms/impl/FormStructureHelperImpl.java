/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~ Copyright 2016 Adobe Systems Incorporated
 ~
 ~ Licensed under the Apache License, Version 2.0 (the "License");
 ~ you may not use this file except in compliance with the License.
 ~ You may obtain a copy of the License at
 ~
 ~     http://www.apache.org/licenses/LICENSE-2.0
 ~
 ~ Unless required by applicable law or agreed to in writing, software
 ~ distributed under the License is distributed on an "AS IS" BASIS,
 ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ~ See the License for the specific language governing permissions and
 ~ limitations under the License.
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

package com.adobe.cq.wcm.core.components.commons.forms.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.resource.LoginException;
import org.apache.sling.api.resource.ModifiableValueMap;
import org.apache.sling.api.resource.PersistenceException;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceResolverFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.adobe.cq.wcm.core.components.commons.forms.FormsConstants;
import com.adobe.cq.wcm.core.components.models.form.Button;
import com.adobe.cq.wcm.core.components.models.form.impl.v1.ButtonImpl;
import com.day.cq.wcm.foundation.forms.FormStructureHelper;

@Component(immediate = true)
@Service(FormStructureHelper.class)
public class FormStructureHelperImpl implements FormStructureHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(FormStructureHelperImpl.class.getName());
    private static final String SLING_SCRIPTING_USER = "sling-scripting";

    @Reference
    private ResourceResolverFactory resourceResolverFactory;

    @Override
    public Resource getFormResource(Resource resource) {
        if (resource == null) {
            return null;
        }
        if (resource.getPath().lastIndexOf("/") == 0) {
            return null;
        }
        for (String resourceType : FormsConstants.RT_ALL_CORE_FORM_CONTAINER) {
            if (resource.isResourceType(resourceType)) {
                return resource;
            }
        }
        return getFormResource(resource.getParent());
    }

    @Override
    public Iterable<Resource> getFormElements(Resource resource) {
        final List<Resource> list = new ArrayList<>();
        if (resource.isResourceType(FormsConstants.RT_CORE_FORM_CONTAINER)) {
            for (Resource child : resource.getChildren()) {
                filterFormElements(child, list);
            }
        }
        return list;
    }

    private void filterFormElements(Resource resource, List<Resource> list) {
        if (isFormResource(resource) && isNoButtonElement(resource)) {
            list.add(resource);
        } else {
            for (Resource child : resource.getChildren()) {
                filterFormElements(child, list);
            }
        }
    }

    private boolean isNoButtonElement(Resource resource) {
        String resourceSuperType = resource.getResourceSuperType();
        if (resource.getResourceType().startsWith(FormsConstants.RT_CORE_FORM_BUTTON) ||
                resourceSuperType != null && resourceSuperType.startsWith(FormsConstants.RT_CORE_FORM_BUTTON)) {
            Button button = resource.adaptTo(Button.class);
            if (button != null) {
                ButtonImpl.Type type = ButtonImpl.Type.fromString(button.getType());
                if (type != null && type == ButtonImpl.Type.SUBMIT) {
                    return false;
                }
            }
        }
        return true;
    }

    private boolean isFormResource(Resource resource) {
        if (resource.getResourceType().startsWith(FormsConstants.RT_CORE_FORM_PREFIX)) {
            return true;
        } else {
            final ResourceResolver scriptResourceResolver = getScriptResourceResolver();
            try {
                if (ifFormResourceSuperType(scriptResourceResolver, resource)) {
                    return true;
                }
            } finally {
                if (scriptResourceResolver.isLive()) {
                    scriptResourceResolver.close();
                }
            }
        }
        return false;
    }

    private boolean ifFormResourceSuperType(ResourceResolver scriptResourceResolver, Resource resource) {
        boolean result = false;
        Resource componentResource = scriptResourceResolver.getResource(resource.getResourceType());
        String parentResourceType = scriptResourceResolver.getParentResourceType(componentResource);
        while (!result && parentResourceType != null) {
            if (parentResourceType.startsWith(FormsConstants.RT_CORE_FORM_PREFIX)) {
                result = true;
            } else {
                parentResourceType = scriptResourceResolver.getParentResourceType(parentResourceType);
            }
        }
        return result;
    }

    @Override
    public boolean canManage(Resource resource) {
        return getFormResource(resource) != null;
    }

    @Override
    public Resource updateFormStructure(Resource formResource) {
        if (formResource != null) {
            ResourceResolver resolver = formResource.getResourceResolver();
            if (formResource.isResourceType(FormsConstants.RT_CORE_FORM_CONTAINER)) {
                // add default action type, form id and action path
                ModifiableValueMap formProperties = formResource.adaptTo(ModifiableValueMap.class);
                if (formProperties != null) {
                    try {
                        if (formProperties.get(com.day.cq.wcm.foundation.forms.FormsConstants.START_PROPERTY_ACTION_TYPE,
                                String.class) == null) {
                            formProperties.put(com.day.cq.wcm.foundation.forms.FormsConstants.START_PROPERTY_ACTION_TYPE,
                                    com.day.cq.wcm.foundation.forms.FormsConstants.DEFAULT_ACTION_TYPE);
                            String defaultContentPath = "/content/usergenerated" +
                                    formResource.getPath().replaceAll("^.content", "").replaceAll("jcr.content.*", "") +
                                    "cq-gen" + System.currentTimeMillis() + "/";
                            formProperties.put(com.day.cq.wcm.foundation.forms.FormsConstants.START_PROPERTY_ACTION_PATH,
                                    defaultContentPath);
                        }
                        if (formProperties.get(com.day.cq.wcm.foundation.forms.FormsConstants.START_PROPERTY_FORMID,
                                String.class) == null) {
                            formProperties.put(com.day.cq.wcm.foundation.forms.FormsConstants.START_PROPERTY_FORMID,
                                    formResource.getPath().replaceAll("[/:.]", "_"));
                        }
                        resolver.commit();
                    } catch (PersistenceException e) {
                        LOGGER.error("Unable to add default action type and form id " + formResource, e);
                    }
                } else {
                    LOGGER.error("Resource is not adaptable to ValueMap - unable to add default action type and " +
                            "form id for " + formResource);
                }
            }
        }
        return null;
    }

    /**
     * Get a {@link ResourceResolver} backed by the Sling scripting user so we can read properties from the search path
     */
    private ResourceResolver getScriptResourceResolver() {
        final Map<String, Object> authenticationInfo = new HashMap<>();
        authenticationInfo.put(ResourceResolverFactory.SUBSERVICE, SLING_SCRIPTING_USER);
        try {
            return resourceResolverFactory.getServiceResourceResolver(authenticationInfo);
        } catch (LoginException e) {
            throw new RuntimeException(e);
        }
    }
}
