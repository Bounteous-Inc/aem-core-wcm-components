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
package com.adobe.cq.wcm.core.components.models.form.impl.v1;

import javax.annotation.PostConstruct;

import org.apache.commons.lang.StringUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import com.adobe.cq.wcm.core.components.commons.form.FormConstants;
import com.adobe.cq.wcm.core.components.models.Constants;
import com.adobe.cq.wcm.core.components.models.form.Button;
import com.day.cq.i18n.I18n;

@Model(adaptables = SlingHttpServletRequest.class,
       adapters = Button.class,
       resourceType = ButtonImpl.RESOURCE_TYPE)
@Exporter(name = Constants.EXPORTER_NAME,
          extensions = Constants.EXPORTER_EXTENSION)
public class ButtonImpl extends AbstractFieldImpl implements Button {

    protected static final String RESOURCE_TYPE = FormConstants.RT_CORE_FORM_BUTTON + "/v1/button";

    private static final String PROP_TYPE_DEFAULT = "submit";
    private static final String PN_TYPE = "type";
    private static final String ID_PREFIX = "form-button";

    @ValueMapValue(name = PN_TYPE)
    @Default(values = PROP_TYPE_DEFAULT)
    private String typeString;

    private Type type;

    @Self
    private SlingHttpServletRequest request;

    private I18n i18n;

    @PostConstruct
    protected void initModel() {
        i18n = new I18n(request);
        type = Type.fromString(typeString);
    }

    @Override
    protected String getIDPrefix() {
        return ID_PREFIX;
    }

    @Override
    public String getHelpMessage() {
        return "";
    }

    @Override
    public Type getType() {
        return this.type;
    }

    @Override
    public String getTitle() {
        if (this.title == null || this.title.trim().isEmpty()) {
            this.title = i18n.getVar(StringUtils.capitalize(this.typeString));
        }
        return this.title;
    }

    @Override
    protected String getDefaultName() {
        return "";
    }

    @Override
    protected String getDefaultValue() {
        return  "";
    }

    @Override
    protected String getDefaultTitle() {
        return "";
    }
}
