/*******************************************************************************
 * Copyright 2016 Adobe Systems Incorporated
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

window.CQ.CoreComponentsIT.Page.v2 = window.CQ.CoreComponentsIT.Page.v2 || {};

/**
 * Tests for the core page component.
 */
;(function(h, $){

    // shortcut
    var c = window.CQ.CoreComponentsIT.commons;
    var pageV1 = window.CQ.CoreComponentsIT.Page.v1;
    var pageV2 = window.CQ.CoreComponentsIT.Page.v2;

    var configuration = "/conf/we-retail";

    /**
     * Test: Check the Advanced Configuration option of a page properties.
     */
    pageV2.tcAdvancedConfigurationPageProperties = function(tcExecuteBeforeTest,tcExecuteAfterTest) {
        return new h.TestCase("Advanced Configuration page property", {
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
        // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(pageV1.openPageProperties)

            /***** Insert information for 'Settings' *****/

            //open the Advanced tab
            .click("coral-tab-label:contains('Advanced')", {delay: 1000})
            //check if the "Advanced" option was selected
            .assert.isTrue(function () {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Advanced')").size() === 1
            })

            //test the configuration settings

            //set the configuration
            .click(".cq-cloudconfig-configpathbrowser .pathbrowser button")
            .assert.visible(".coral-Pathbrowser-picker")
            .click(".coral-Pathbrowser-picker [data-value='" + configuration + "']")
            .assert.isTrue(function () {
                return h.find("a.is-active[data-value='" + configuration + "']")
            })
            .click(".coral-Pathbrowser-picker .js-coral-pathbrowser-confirm")

            /*****  Check if the configuration is saved *****/

            //save the configuration and open again the page property
            .click("coral-buttongroup button:contains('Save & Close')",{expectNav:true})
            .execTestCase(pageV1.openPageProperties)
            .click("coral-tab-label:contains('Advanced')", {delay: 1000})

            //check the configuration
            .assert.isTrue(function (opts) {
                return h.find("input[name='./cq:conf'] span:contains('" + configuration + "')")
            });
    };

}(hobs, jQuery));
