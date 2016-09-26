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
package apps.core.wcm.components.list.v1;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import javax.jcr.Session;
import javax.script.Bindings;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.junit.Test;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;

import apps.core.wcm.components.list.v1.list.List;

import com.adobe.cq.wcm.core.components.testing.WCMUsePojoBaseTest;
import com.day.cq.commons.RangeIterator;
import com.day.cq.search.Query;
import com.day.cq.search.QueryBuilder;
import com.day.cq.search.SimpleSearch;
import com.day.cq.search.result.Hit;
import com.day.cq.search.result.SearchResult;
import com.day.cq.tagging.TagManager;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;

@PrepareForTest(List.class)
public class ListTest extends WCMUsePojoBaseTest<List> {

    static {
        TEST_CONTENT_ROOT = "/content/list";
        TEST_APPS_ROOT = "/apps/core/wcm/components/list";
        TEST_BASE = "/list";
    }
    
    
    public static final String CHILDREN_LIST = TEST_CONTENT_ROOT + "/jcr:content/sidebar/list-children";
    public static final String CHILDREN_LIST_PAGINATED = TEST_CONTENT_ROOT + "/jcr:content/sidebar/list-children-paginated";
    public static final String STATIC_LIST = TEST_CONTENT_ROOT + "/jcr:content/sidebar/list-static";
    public static final String SEARCH_LIST = TEST_CONTENT_ROOT + "/jcr:content/sidebar/list-search";
    public static final String QUERY_LIST = TEST_CONTENT_ROOT + "/jcr:content/sidebar/list-query";
    public static final String TAGS_LIST = TEST_CONTENT_ROOT + "/jcr:content/sidebar/list-tags";

    @Test
    public void testListFromChildrenPages() {
        List list = getSpiedObject(CHILDREN_LIST);
        checkListConsistency(list, new String[]{"Biking", "Hiking", "Running", "Skiing", "Surfing"});
    }

    @Test
    public void testListFromChildrenPagesPaginated() {
        context.request().setParameterMap(new HashMap<String, Object>(){{
            put("sidebar_list-children-paginated_start", 2);
        }});
        List list = getSpiedObject(CHILDREN_LIST_PAGINATED);
        checkListConsistency(list, new String[]{"Running", "Skiing"});
        assertEquals("/content/list/jcr:content/sidebar/list-children-paginated.html?sidebar_list-children-paginated_start=4", list
                .nextLink());
        assertEquals("/content/list/jcr:content/sidebar/list-children-paginated.html?sidebar_list-children-paginated_start=0", list.previousLink());
        assertTrue("Expected a paginated list.", list.isPaginating());
        assertEquals("sidebar_list-children-paginated", list.getListId());
        assertEquals("Expected an unordered list.", "ul", list.getListHTMLElement());
        assertEquals("Expected a default list.", "default", list.getType());
        assertFalse("Did not expect an empty list.", list.isEmpty());
        assertEquals("Expected the list to start from page number 2.", 2, list.getPageStart());
        assertEquals("Core WCM List Component (v1)", list.getComponentTitle());
    }

    @Test
    public void testListFromStaticPages() {
        List list = getSpiedObject(STATIC_LIST);
        checkListConsistency(list, new String[]{"Biking", "Surfing"});
    }

    @Test
    public void testListFromSearch() throws Exception {
        final Resource resource = context.resourceResolver().getResource(SEARCH_LIST);
        Bindings bindings = getResourceBackedBindings(SEARCH_LIST);
        List list = getSpiedObject();
        Resource resourceSpy = PowerMockito.spy(resource);
        SimpleSearch simpleSearch = Mockito.mock(SimpleSearch.class);
        SearchResult searchResult = Mockito.mock(SearchResult.class);
        when(simpleSearch.getResult()).thenReturn(searchResult);
        java.util.List<Hit> hits = new ArrayList<Hit>() {{
            add(getMockedHit(context.resourceResolver().getResource("/content/list/cajamara-biking")));
        }};
        when(searchResult.getHits()).thenReturn(hits);
        doReturn(simpleSearch).when(resourceSpy).adaptTo(SimpleSearch.class);
        doReturn(resourceSpy).when(list).getResource();
        list.init(bindings);
        checkListConsistency(list, new String[]{"Biking"});
    }

    @Test
    public void testListFromQuery() throws Exception {
        final Resource resource = context.resourceResolver().getResource(QUERY_LIST);
        Bindings bindings = getResourceBackedBindings(QUERY_LIST);
        List list = getSpiedObject();
        Resource resourceSpy = PowerMockito.spy(resource);
        final ResourceResolver resourceResolverSpy = PowerMockito.spy(context.resourceResolver());
        QueryBuilder queryBuilder = Mockito.mock(QueryBuilder.class);
        Session session = Mockito.mock(Session.class);
        doReturn(queryBuilder).when(resourceResolverSpy).adaptTo(QueryBuilder.class);
        doReturn(session).when(resourceResolverSpy).adaptTo(Session.class);
        Query query = Mockito.mock(Query.class);
        SearchResult searchResult = Mockito.mock(SearchResult.class);
        java.util.List<Hit> hits = new ArrayList<Hit>() {{
            add(getMockedHit(context.resourceResolver().getResource("/content/list/cajamara-biking")));
            add(getMockedHit(context.resourceResolver().getResource("/content/list/jola-summer-surfing")));
            add(getMockedHit(context.resourceResolver().getResource("/content/list/nairobi-runners-running")));
            add(getMockedHit(context.resourceResolver().getResource("/content/list/whistler-snow-skiing")));
            add(getMockedHit(context.resourceResolver().getResource("/content/list/cuzco-hiking")));
        }};

        when(queryBuilder.loadQuery(resource.getPath() + "/" + List.PROP_SAVED_QUERY, session)).thenReturn(query);
        when(query.getResult()).thenReturn(searchResult);
        when(searchResult.getHits()).thenReturn(hits);
        doReturn(resourceSpy).when(list).getResource();
        doReturn(resourceResolverSpy).when(resourceSpy).getResourceResolver();
        list.init(bindings);
        checkListConsistency(list, new String[]{"Biking", "Hiking", "Running", "Skiing", "Surfing"});
    }

    @Test
    public void testListFromTags() throws Exception {
        final Resource resource = context.resourceResolver().getResource(TAGS_LIST);
        Bindings bindings = getResourceBackedBindings(TAGS_LIST);
        List list = getSpiedObject();
        final ResourceResolver resourceResolverSpy = PowerMockito.spy(context.resourceResolver());
        Resource resourceSpy = PowerMockito.spy(resource);
        TagManager tagManager = Mockito.mock(TagManager.class);
        ArrayList<Resource> results = new ArrayList<Resource>() {{
            add(context.resourceResolver().getResource("/content/list/cajamara-biking"));
        }};
        final Iterator<Resource> resultsIterator = results.iterator();
        RangeIterator<Resource> iterator = new RangeIterator<Resource>() {
            @Override
            public void skip(long l) {
            }

            @Override
            public long getSize() {
                return 0;
            }

            @Override
            public long getPosition() {
                return 0;
            }

            @Override
            public boolean hasNext() {
                return resultsIterator.hasNext();
            }

            @Override
            public Resource next() {
                return resultsIterator.next();
            }

            @Override
            public void remove() {
                throw new UnsupportedOperationException();
            }
        };
        when(tagManager.find("/content/list", new String[] {"geometrixx-outdoors:activity/biking"}, true)).thenReturn(iterator);
        doReturn(tagManager).when(resourceResolverSpy).adaptTo(TagManager.class);
        doReturn(resourceSpy).when(list).getResource();
        doReturn(resourceResolverSpy).when(resourceSpy).getResourceResolver();
        list.init(bindings);
        checkListConsistency(list, new String[]{"Biking"});
    }

    private void checkListConsistency(List list, String[] expectedPages) {
        assertTrue("Expected that the returned list will contain " + expectedPages.length + " items",
                list.getItems().size() == expectedPages.length);
        int index = 0;
        for (List.ListItem item : list.getItems()) {
            assertEquals(expectedPages[index++], item.getName());
        }
    }

    private Hit getMockedHit(Resource resource) throws Exception {
        Hit hit = Mockito.mock(Hit.class);
        when(hit.getResource()).thenReturn(resource);
        return hit;
    }

}
