/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~ Copyright 2017 Adobe Systems Incorporated
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
package com.adobe.cq.wcm.core.components.sandbox.internal.models.v1;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nonnull;
import javax.annotation.PostConstruct;
import javax.jcr.RepositoryException;
import javax.jcr.Session;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.apache.sling.models.annotations.injectorspecific.ScriptVariable;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.wcm.core.components.internal.Constants;
import com.adobe.cq.wcm.core.components.sandbox.models.ListItem;
import com.adobe.cq.wcm.core.components.sandbox.models.Search;
import com.day.cq.search.PredicateConverter;
import com.day.cq.search.PredicateGroup;
import com.day.cq.search.Query;
import com.day.cq.search.QueryBuilder;
import com.day.cq.search.result.Hit;
import com.day.cq.search.result.SearchResult;
import com.day.cq.wcm.api.NameConstants;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import com.day.cq.wcm.api.designer.Style;

@Model(adaptables = SlingHttpServletRequest.class,
       adapters = {Search.class, ComponentExporter.class},
       resourceType = {SearchImpl.RESOURCE_TYPE})
@Exporter(name = Constants.EXPORTER_NAME,
          extensions = Constants.EXPORTER_EXTENSION)
public class SearchImpl implements Search {

    protected static final String RESOURCE_TYPE = "core/wcm/sandbox/components/search/v1/search";

    private static final Logger LOGGER = LoggerFactory.getLogger(SearchImpl.class);

    protected static final int PROP_START_LEVEL_DEFAULT = 2;
    protected static final int PROP_RESULTS_SIZE_DEFAULT = 10;
    protected static final int PROP_SEARCH_TERM_MINIMUM_LENGTH_DEFAULT = 3;

    protected static final String PARAM_FULLTEXT = "fulltext";
    private static final String PARAM_RESULTS_OFFSET = "resultsOffset";
    private static final String PREDICATE_FULLTEXT = "fulltext";
    private static final String PREDICATE_TYPE = "type";
    private static final String PREDICATE_PATH = "path";

    @Self
    private SlingHttpServletRequest request;

    @SlingObject
    private ResourceResolver resourceResolver;

    @OSGiService
    private QueryBuilder queryBuilder;

    @ScriptVariable
    private Page currentPage;

    @ScriptVariable
    private ValueMap properties;

    @ScriptVariable
    private Style currentStyle;

    private PageManager pageManager;
    private String path;
    private int resultsSize;
    private int searchTermMinimumLength;

    @PostConstruct
    private void initModel() {
        pageManager = resourceResolver.adaptTo(PageManager.class);
        int startLevel = properties.get(PN_START_LEVEL, currentStyle.get(PN_START_LEVEL, PROP_START_LEVEL_DEFAULT));
        path = calculatePath(startLevel);
        resultsSize = currentStyle.get(PN_RESULTS_SIZE, PROP_RESULTS_SIZE_DEFAULT);
        searchTermMinimumLength = currentStyle.get(PN_SEARCH_TERM_MINIMUM_LENGTH, PROP_SEARCH_TERM_MINIMUM_LENGTH_DEFAULT);
    }

    private String calculatePath(int startLevel) {
        Page rootPage = currentPage.getAbsoluteParent(startLevel);
        if(rootPage != null) {
            return rootPage.getPath();
        } else {
            return currentPage.getPath();
        }
    }

    @Override
    public int getResultsSize() {
        return resultsSize;
    }

    @Override
    public int getSearchTermMinimumLength() {
        return searchTermMinimumLength;
    }

    @Override
    public List<ListItem> getResults() {
        List<ListItem> results = new ArrayList<>();
        String fulltext = request.getParameter(PARAM_FULLTEXT);
        if (fulltext == null || fulltext.length() < searchTermMinimumLength) {
            return results;
        }
        long resultsOffset = 0;
        if (request.getParameter(PARAM_RESULTS_OFFSET) != null) {
            resultsOffset = Long.parseLong(request.getParameter(PARAM_RESULTS_OFFSET));
        }
        Map<String,String> predicatesMap = new HashMap<>();
        predicatesMap.put(PREDICATE_FULLTEXT, fulltext);
        predicatesMap.put(PREDICATE_PATH, path);
        predicatesMap.put(PREDICATE_TYPE, NameConstants.NT_PAGE);
        PredicateGroup predicates = PredicateConverter.createPredicates(predicatesMap);

        Query query = queryBuilder.createQuery(predicates, resourceResolver.adaptTo(Session.class));
        if (resultsSize != 0) {
            query.setHitsPerPage(resultsSize);
        }
        if (resultsOffset != 0) {
            query.setStart(resultsOffset);
        }
        SearchResult searchResult = query.getResult();

        List<Hit> hits = searchResult.getHits();
        if (hits != null) {
            for (Hit hit : hits) {
                try {
                    Resource hitRes = hit.getResource();
                    Page page = getPage(hitRes);
                    if (page != null) {
                        results.add(new PageListItemImpl(request, page));
                    }
                } catch (RepositoryException e) {
                    LOGGER.error("Unable to retrieve search results for query.", e);
                }
            }
        }
        return results;
    }

    @Nonnull
    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }

    private Page getPage(Resource resource) {
        if (resource != null) {
            ResourceResolver resourceResolver = resource.getResourceResolver();
            PageManager pageManager = resourceResolver.adaptTo(PageManager.class);
            if (pageManager != null) {
                return pageManager.getContainingPage(resource);
            }
        }
        return null;
    }

}
