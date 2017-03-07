/*******************************************************************************
 * Copyright 2016 Adobe Systems Incorporated
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
package com.adobe.cq.wcm.core.components.models.impl.v1;

import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.jackrabbit.util.Text;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceMetadata;
import org.apache.sling.commons.json.JSONArray;
import org.apache.sling.commons.json.JSONObject;
import org.apache.sling.commons.mime.MimeTypeService;
import org.apache.sling.commons.osgi.PropertiesUtil;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.Source;
import org.apache.sling.models.annotations.injectorspecific.InjectionStrategy;
import org.apache.sling.models.annotations.injectorspecific.ScriptVariable;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.adobe.cq.sightly.SightlyWCMMode;
import com.adobe.cq.wcm.core.components.internal.servlets.AdaptiveImageServlet;
import com.adobe.cq.wcm.core.components.internal.Constants;
import com.adobe.cq.wcm.core.components.models.Image;
import com.day.cq.commons.DownloadResource;
import com.day.cq.commons.ImageResource;
import com.day.cq.commons.jcr.JcrConstants;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import com.day.cq.wcm.api.designer.Style;

@Model(adaptables = SlingHttpServletRequest.class, adapters = Image.class, resourceType = ImageImpl.RESOURCE_TYPE)
@Exporter(name = Constants.EXPORTER_NAME, extensions = Constants.EXPORTER_EXTENSION)
public class ImageImpl implements Image {

    public static final String RESOURCE_TYPE = "core/wcm/components/image/v1/image";
    public static final String DEFAULT_EXTENSION = "jpeg";

    private static final Logger LOGGER = LoggerFactory.getLogger(ImageImpl.class);
    private static final String DOT = ".";
    private static final String MIME_TYPE_IMAGE_JPEG = "image/jpeg";

    @Self
    private SlingHttpServletRequest request;

    @Inject
    private Resource resource;

    @ScriptVariable
    private Style currentStyle;

    @ScriptVariable
    private PageManager pageManager;

    @ScriptVariable
    private SightlyWCMMode wcmmode;

    @Inject
    @Source("osgi-services")
    private MimeTypeService mimeTypeService;

    @ValueMapValue(name = DownloadResource.PN_REFERENCE, injectionStrategy = InjectionStrategy.OPTIONAL)
    private String fileReference;

    @ValueMapValue(name = PN_IS_DECORATIVE, injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(booleanValues = false)
    private boolean isDecorative;

    @ValueMapValue(name = PN_DISPLAY_POPUP_TITLE, injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(booleanValues = false)
    private boolean displayPopupTitle;

    @ValueMapValue(name = ImageResource.PN_ALT, injectionStrategy = InjectionStrategy.OPTIONAL)
    private String alt;

    @ValueMapValue(name = JcrConstants.JCR_TITLE, injectionStrategy = InjectionStrategy.OPTIONAL)
    private String title;

    @ValueMapValue(name = ImageResource.PN_LINK_URL, injectionStrategy = InjectionStrategy.OPTIONAL)
    private String linkURL;

    private String extension;
    private String src;
    private String[] smartImages = new String[]{};
    private int[] smartSizes = new int[0];
    private String json;

    // content policy settings
    private Set<Integer> allowedRenditionWidths;
    private boolean disableLazyLoading;

    @PostConstruct
    private void initModel() {
        boolean hasContent = false;
        if (StringUtils.isNotEmpty(fileReference)) {
            int dotIndex;
            if ((dotIndex = fileReference.lastIndexOf(DOT)) != -1) {
                extension = fileReference.substring(dotIndex + 1);
            }
            hasContent = true;
        } else {
            Resource file = resource.getChild(DownloadResource.NN_FILE);
            if (file != null) {
                extension = mimeTypeService.getExtension(
                        PropertiesUtil.toString(file.getResourceMetadata().get(ResourceMetadata.CONTENT_TYPE), MIME_TYPE_IMAGE_JPEG)
                );
                hasContent = true;
            }
        }
        if (hasContent) {
            if (extension.equalsIgnoreCase("tif") || extension.equalsIgnoreCase("tiff")) {
                extension = DEFAULT_EXTENSION;
            }
            Set<Integer> supportedRenditionWidths = getSupportedRenditionWidths();
            smartImages = new String[supportedRenditionWidths.size()];
            smartSizes = new int[supportedRenditionWidths.size()];
            int index = 0;
            String escapedResourcePath = Text.escapePath(resource.getPath());
            for (Integer width : supportedRenditionWidths) {
                smartImages[index] = request.getContextPath() + escapedResourcePath + DOT + AdaptiveImageServlet.DEFAULT_SELECTOR + DOT +
                        width + DOT + extension;
                smartSizes[index] = width;
                index++;
            }
            if (smartSizes.length == 0 || smartSizes.length >= 2) {
                src = request.getContextPath() + escapedResourcePath + DOT + AdaptiveImageServlet.DEFAULT_SELECTOR + DOT + extension;
            } else if (smartSizes.length == 1) {
                src = request.getContextPath() + escapedResourcePath + DOT + AdaptiveImageServlet.DEFAULT_SELECTOR + DOT + smartSizes[0] +
                        DOT + extension;
            }

            // cache breaker for edit mode to refresh image after drag-and-drop
            if(wcmmode.isEdit()) {
                src = src + "?" + System.currentTimeMillis();
            }

            disableLazyLoading = currentStyle.get(PN_DESIGN_LAZY_LOADING_ENABLED, false);
            if (!isDecorative) {
                Page page = pageManager.getPage(linkURL);
                if (page != null) {
                    String vanityURL = page.getVanityUrl();
                    linkURL = (vanityURL == null ? linkURL + ".html" : vanityURL);
                }
            } else {
                linkURL = null;
            }
            buildJson();
        }
    }

    @Override
    public String getSrc() {
        return src;
    }

    @Override
    public boolean displayPopupTitle() {
        return displayPopupTitle;
    }

    @Override
    public String getAlt() {
        return alt;
    }

    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public String getLink() {
        return linkURL;
    }

    @Override
    public String getFileReference() {
        return fileReference;
    }

    @Override
    public String getJson() {
        return json;
    }

    private void buildJson() {
        Map<String, Object> objectMap = new HashMap<>();
        objectMap.put(Image.JSON_SMART_SIZES, new JSONArray(Arrays.asList(ArrayUtils.toObject(smartSizes))));
        objectMap.put(Image.JSON_SMART_IMAGES, new JSONArray(Arrays.asList(smartImages)));
        objectMap.put(Image.JSON_LAZY_ENABLED, !disableLazyLoading);
        json = new JSONObject(objectMap).toString();
    }

    private Set<Integer> getSupportedRenditionWidths() {
        if (allowedRenditionWidths == null) {
            allowedRenditionWidths = new LinkedHashSet<>();
            String[] supportedWidthsConfig = currentStyle.get(PN_DESIGN_ALLOWED_RENDITION_WIDTHS, new String[0]);
            for (String width : supportedWidthsConfig) {
                try {
                    allowedRenditionWidths.add(Integer.parseInt(width));
                } catch (NumberFormatException e) {
                    LOGGER.error(String.format("Invalid width detected (%s) for content policy configuration.", width), e);
                }
            }
        }
        return allowedRenditionWidths;
    }
}
