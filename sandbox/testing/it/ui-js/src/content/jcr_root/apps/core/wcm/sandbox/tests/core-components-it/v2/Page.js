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

/**
 * Tests for the core page component.
 */
;(function(h, $){

    // shortcut
    var c = window.CQ.CoreComponentsIT.commons;
    var tag1 = "We.Retail : Activity / Biking"
    var tag2 = "We.Retail : Activity / Hiking"
    var pageTitle = "This is the page title"
    var navTitle = "This is the navigation title"
    var subtitle = "This is the page subtitle"
    var description = "This is the page description"
    var vanityURL = "test/test-Page-URL"
    var language = "Romanian"
    var design = "/etc/designs/we-retail/images/flags"
    var alias  = "This is an alias"
    var allowedTemplate = "allowedTemplates"
    var loginPage = "/content/core-components/core-components-page"
    var exportConfiguration = "/etc/contentsync/templates/dps-default"
    var contextHubPath = "/etc/cloudsettings/default/contexthub/device"
    var segmentsPath = "/conf/we-retail/settings/wcm/segments"

    /**
     * Test: open the page property.
     */
    openPageProperties = new h.TestCase("Open the page property")
        //select the page
        .execFct(function(opts, done){
            c.setPageName(h.param("testPagePath")(opts),"testPageName",done);
        })
        .click('coral-columnview-item:contains("%testPageName%") coral-columnview-item-thumbnail')
        .click("button.cq-siteadmin-admin-actions-properties-activator")
    ;

    /**
     * Before Test Case
     */
    var tcExecuteBeforeTest = new TestCase("Setup Before Test")
        // common set up
        .execTestCase(c.tcExecuteBeforeTest)
        // create the test page, store page path in 'testPagePath'
        .execFct(function (opts,done) {
            c.createPage(c.template, c.rootPage ,'page_' + Date.now(),"testPagePath",done, 'core/wcm/sandbox/tests/components/test-page-v2')
        })

    ;

    /**
     * After Test Case
     */
    var tcExecuteAfterTest = new TestCase("Clean up after Test")
        // common clean up
        .execTestCase(c.tcExecuteAfterTest)
        // delete the test page we created
        .execFct(function (opts, done) {
            c.deletePage(h.param("testPagePath")(opts), done);
        });

    /**
     * Test: Check the Basic Title and Tags options of a page properties.
     */
    var basicTitleAndTagsPageProperties = new h.TestCase("Basic Title and Tags page properties",{
        execBefore: tcExecuteBeforeTest,
        execAfter: tcExecuteAfterTest
    })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            /***** Insert information for 'Title and Tags' *****/

            //open the Basic tab
            .click("coral-tab-label:contains('Basic')")
            //check if the "Basic" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Basic')").size() == 1
            })

            //check the page title
            .assert.isTrue(function(opts){
                return h.find("input[name='./jcr:title']").val() === h.param("testPageName")(opts)
            })
            //change the page title
            .fillInput("input[name='./jcr:title']","Page")

            //add two tags
            .click("foundation-autocomplete.cq-ui-tagfield button")
            .click("coral-columnview-item-content[title='We.Retail']")
            .click("coral-columnview-item-content[title='Activity']")
            .click("coral-columnview-item:contains('Biking') coral-columnview-item-thumbnail")
            .click("coral-columnview-item:contains('Hiking') coral-columnview-item-thumbnail")
            .click("button.granite-pickerdialog-submit")
            //check if tags were added
            .assert.exist("coral-taglist[name='./cq:tags'] coral-tag:contains('"+tag1+"')")
            .assert.exist("coral-taglist[name='./cq:tags'] coral-tag:contains('"+tag2+"')")

            //detele a tag
            .click("coral-taglist[name='./cq:tags'] coral-tag:contains('"+tag2+"') > button")
            .assert.exist("coral-taglist[name='./cq:tags'] coral-tag:contains('"+tag2+"')", false)

            //set the Hide in Navigation
            .click("input[name='./hideInNav']")

            /*****  Check if the date is saved *****/

            //save the configuration and open again the page property
            .click("coral-buttongroup button:contains('Save & Close')")
            .execTestCase(openPageProperties)
            .click("coral-tab-label:contains('Basic')")

            //check the page title
            .assert.isTrue(function(opts){
                return h.find("input[name='./jcr:title']").val() === "Page"
            })
            //check if the tags were saved
            .assert.exist("coral-taglist[name='./cq:tags'] coral-tag:contains('"+tag1+"')")

            //check if 'Hide in Navigation' is checked
            .assert.isTrue(function(opts){
                return h.find("coral-checkbox[name='./hideInNav'][checked]")
            })
    ;

    /**
     * Test: Check the Basic More titles and descriptions options of a page properties.
     */
    var basicTitlesAndDescriptionsPageProperties = new h.TestCase("Basic Titles and Descriptions page properties",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            /***** Insert information for 'More Titles and Description' *****/

            //open the Basic tab
            .click("coral-tab-label:contains('Basic')")
            //check if the "Basic" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Basic')").size() == 1
            })

            .simulate("input[name='./pageTitle']", "key-sequence",
                {sequence: pageTitle})
            .simulate("input[name='./navTitle']", "key-sequence",
                {sequence: navTitle})
            .simulate("input[name='./subtitle']", "key-sequence",
                {sequence: subtitle})
            .simulate("textarea[name='./jcr:description']", "key-sequence",
                {sequence: description})

            /*****  Check if the date is saved *****/

            //save the configuration and open again the page property
            .click("coral-buttongroup button:contains('Save & Close')")
            .execTestCase(openPageProperties)
            .click("coral-tab-label:contains('Basic')")

            //check the saved data
            .assert.isTrue(function(opts){
                return h.find("input[name='./pageTitle']").val() === pageTitle
            })
            .assert.isTrue(function(opts){
                return h.find("input[name='./navTitle']").val() === navTitle
            })
            .assert.isTrue(function(opts){
                return h.find("input[name='./subtitle']").val() === subtitle
            })
            .assert.isTrue(function(opts){
                return h.find("textarea[name='./jcr:description").val() === description
            })
    ;

    /**
     * Test: Check the Basic On/Off time options of a page properties.
     */
    var basicOnOffTimePageProperties = new h.TestCase("Basic On/Off time page property",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            /***** Insert information for On/Off time *****/

            //open the Basic tab
            .click("coral-tab-label:contains('Basic')")
            //check if the "Basic" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Basic')").size() == 1
            })

            // open calendar for OnTime
            .click("coral-datepicker[name='./onTime'] button:has(coral-icon.coral-Icon--calendar)")
            // choose next month
            .click("coral-datepicker[name='./onTime'] button.coral-Calendar-nextMonth")
            // select first day
            .click("coral-datepicker[name='./onTime'] td a:contains('1'):eq(0)", {delay: 1000})
            // open calendar for OffTime
            .click("coral-datepicker[name='./offTime'] button:has(coral-icon.coral-Icon--calendar)")
            // choose next month
            .click("coral-datepicker[name='./offTime'] button.coral-Calendar-nextMonth")
            // select second day
            .click("coral-datepicker[name='./offTime'] td a:contains('2'):eq(0)", {delay: 1000})

            /*****  Check if the date is saved *****/

            //save the configuration and open again the page property
            .click("coral-buttongroup button:contains('Save & Close')")
            .execTestCase(openPageProperties)
            .click("coral-tab-label:contains('Basic')")

            //check the on time
            .assert.isTrue(function(opts){
                return h.find("input[name='./onTime']").val() !== ""
            })
            //check the off time
            .assert.isTrue(function(opts){
                return h.find("input[name='./offTime']").val() !== ""
            })
    ;

    /**
     * Test: Check the Basic vanity URL options of a page properties.
     */
    var basicVanityUrlPageProperties = new h.TestCase("Basic Vanity URL page property",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            /***** Insert information for 'Vanity URL' *****/

            //open the Basic tab
            .click("coral-tab-label:contains('Basic')")
            //check if the "Basic" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Basic')").size() == 1
            })

            //add a vanity url
            .click("coral-multifield[data-granite-coral-multifield-name='./sling:vanityPath'] > button")
            .simulate("input[name='./sling:vanityPath']", "key-sequence",
                {sequence: vanityURL})
            //delete a vanity Url
            .click("coral-multifield[data-granite-coral-multifield-name='./sling:vanityPath'] button.coral-Multifield-remove")
            //add again the vanity url
            .click("coral-multifield[data-granite-coral-multifield-name='./sling:vanityPath'] > button")
            .simulate("input[name='./sling:vanityPath']", "key-sequence",
                {sequence: vanityURL})

            //set the Redirect Vanity URL
            .click("input[name='./sling:redirect']")

            /*****  Check if data are saved *****/

            //save the configuration and open again the page property
            .click("coral-buttongroup button:contains('Save & Close')")
            .execTestCase(openPageProperties)
            .click("coral-tab-label:contains('Basic')")

            //check if the vanity url was saved
            .assert.isTrue(function(opts){
                return h.find("input[name='./sling:vanityPath']").val() === vanityURL
            })
            //check if 'Redirect Vanity URL' is checked
            .assert.isTrue(function(opts){
                return h.find("coral-checkbox[name='./sling:redirect'][checked]")
            })
    ;

    /**
     * Test: Check the Advanced Settings options of a page properties.
     */
    var advancedSettingsPageProperties = new h.TestCase("Advanced Settings page property",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            /***** Insert information for 'Settings' *****/

            //open the Advanced tab
            .click("coral-tab-label:contains('Advanced')",{delay:1000})
            //check if the "Advanced" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Advanced')").size() == 1
            })

            //test the Settings options

            //set the language
            .click("coral-select[name='./jcr:language'] > button")
            .click("coral-select[name='./jcr:language'] coral-selectlist-item:contains('"+language+"')")
            //set the desigh path
            .fillInput("foundation-autocomplete[name='./cq:designPath'] input.coral-Textfield", design)
            //set the alias
            .simulate("input[name='./sling:alias']", "key-sequence",
                {sequence: alias})

            /*****  Check if the date is saved *****/

            //save the configuration and open again the page property
            .click("coral-buttongroup button:contains('Save & Close')")
            .execTestCase(openPageProperties)
            .click("coral-tab-label:contains('Advanced')",{delay:1000})

            //check the language
            .assert.isTrue(function(opts){
                return h.find("coral-select[name='./jcr:language'] span:contains('"+language+"')")
            })
            //check the design
            .assert.isTrue(function(opts){
                return h.find("input[name='./cq:designPath']").val() === design
            })
            //check the alias
            .assert.isTrue(function(opts){
                return h.find("input[name='./sling:alias']").val() === alias
            })
    ;

    /**
     * Test: Check the Advanced Templates options of a page properties.
     */
    var advancedTemplatesSettingsPageProperties = new h.TestCase("Advanced Templates page property",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            /***** Insert information for 'Settings' *****/

            //open the Advanced tab
            .click("coral-tab-label:contains('Advanced')",{delay:1000})
            //check if the "Advanced" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Advanced')").size() == 1
            })

            //test the template settings
            .click("coral-multifield[data-granite-coral-multifield-name='./cq:allowedTemplates'] > button")
            .simulate("input[name='./cq:allowedTemplates']", "key-sequence",
                {sequence: allowedTemplate})
            //detele the allowed template
            .click("coral-multifield[data-granite-coral-multifield-name='./cq:allowedTemplates'] button.coral-Multifield-remove")
            //add again the allowed template
            .click("coral-multifield[data-granite-coral-multifield-name='./cq:allowedTemplates'] > button")
            .simulate("input[name='./cq:allowedTemplates']", "key-sequence",
                {sequence: allowedTemplate})

            /*****  Check if the date is saved *****/

            //save the configuration and open again the page property
            .click("coral-buttongroup button:contains('Save & Close')")
            .execTestCase(openPageProperties)
            .click("coral-tab-label:contains('Advanced')",{delay:1000})

            //check the saved template
            .assert.isTrue(function(opts){
                return h.find("input[name='./cq:allowedTemplates']").val() === allowedTemplate
            })
    ;

    /**
     * Test: Check the Advanced Authentication options of a page properties.
     */
    var advancedAuthenticationPageProperties = new h.TestCase("Advanced Authentication page property",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            /***** Insert information for 'Settings' *****/

            //open the Advanced tab
            .click("coral-tab-label:contains('Advanced')",{delay:1000})
            //check if the "Advanced" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Advanced')").size() == 1
            })

            //test the authentication requirement
            .click("input[name='./cq:authenticationRequired']")
            .fillInput("foundation-autocomplete[name='./cq:loginPath'] input.coral-Textfield", loginPage, {delay:1000})
            .click("button[value='"+loginPage+"']")

            /*****  Check if the date is saved *****/

            //save the configuration and open again the page property
            .click("coral-buttongroup button:contains('Save & Close')")
            .execTestCase(openPageProperties)
            .click("coral-tab-label:contains('Advanced')",{delay:1000})

            //check the Enable check
            .assert.isTrue(function(opts){
                return h.find("coral-checkbox[name='./cq:authenticationRequired'] checked")
            })
            //check the login page
            .assert.isTrue(function(opts){
                return h.find("input[name='./cq:loginPath']").val() === loginPage
            })
    ;

    /**
     * Test: Check the Advanced Export options of a page properties.
     */
    var advancedExportPageProperties = new h.TestCase("Advanced Export page property",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            /***** Insert information for 'Settings' *****/

            //open the Advanced tab
            .click("coral-tab-label:contains('Advanced')",{delay:1000})
            //check if the "Advanced" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Advanced')").size() == 1
            })

            //tests for the export options
            .fillInput("foundation-autocomplete[name='./cq:exportTemplate'] input.coral-Textfield", exportConfiguration)
            .click("button[value='"+exportConfiguration+"']")

            /*****  Check if the date is saved *****/

            //save the configuration and open again the page property
            .click("coral-buttongroup button:contains('Save & Close')")
            .execTestCase(openPageProperties)
            .click("coral-tab-label:contains('Advanced')",{delay:1000})

            //check the Export Configuration
            .assert.isTrue(function(opts){
                return h.find("input[name='./cq:exportTemplate']").val() === exportConfiguration
            })
        ;

    /**
     * Test: Check the Thumbnail options of a page properties.
     */
    var thumbnailPageProperties = new h.TestCase("Thumbnail page property",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            .click("coral-tab-label:contains('Thumbnail')",{delay:1000})
            //check if the "Thumbnail" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Thumbnail')").size() == 1
            })

            .click("button:contains('Generate Preview')")
            /*
            .execFct(function(opts, done){

                // check defaults
                var maxRetries = 10;
                var timeout = 5000;
                // retry counter
                var retries = 0;

                // the polling function
                var poll = function () {

                    if (h.find("button:contains('Revert')").is(":visible")) {
                        done(true)
                    }
                    else {
                        if (retries++ === maxRetries) {
                            done(false, "getting the Revert button failed!");
                            return;
                        }
                        // set for next retry
                        setTimeout(poll, timeout);
                    }
                };
                // start polling
                poll();
            })
            .click("button:contains('Revert')")
            .assert.visible("button:contains('Revert')", false)
            .assert.visible("button:contains('Upload Image')")
            */
        ;

    /**
     * Test: Check the Social Media options of a page properties.
     */
    var socialMediaPageProperties = new h.TestCase("Social Media page property",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            .click("coral-tab-label:contains('Social Media')",{delay:1000})
            //check if the "Social Media" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Social Media')").size() == 1
            })

            //test social media sharing
            .click("input[name='./socialMedia'][value='facebook']")
            .click("input[name='./socialMedia'][value='pinterest']")
            .click("foundation-autocomplete[name='./variantPath'] button[title='Open Selection Dialog']")
            .click("form.granite-pickerdialog-content button:contains('Cancel')")

            /*****  Check if the date is saved *****/

            //save the configuration and open again the page property
            .click("coral-buttongroup button:contains('Save & Close')")
            .execTestCase(openPageProperties)
            .click("coral-tab-label:contains('Social Media')",{delay:1000})

            //check if facebook is checked
            .assert.isTrue(function(opts){
                return h.find("coral-checkbox[name='./socialMedia'][value='facebook'] checked")
            })
            //check if pinterest is checked
            .assert.isTrue(function(opts){
                return h.find("coral-checkbox[name='./socialMedia'][value='pinterest'] checked")
            })
        ;

    /**
     * Test: Check the Cloud Services options of a page properties.
     */
    var cloudServicesPageProperties = new h.TestCase("Cloud Services page property",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            .click("coral-tab-label:contains('Cloud Services')",{delay:1000})
            //check if the "Cloud Services" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Cloud Services')").size() == 1
            })

            .click("span:contains('Add Configuration')")
            .click("coral-selectlist span:contains('Facebook Connect')")
            .click("span:contains('Add Configuration')")
            .click("coral-selectlist span:contains('Twitter Connect')")
            //detele the Twitter Connect
            .click("button[data-title='Twitter Connect']")

            /*****  Check if the date is saved *****/

            //save the configuration and open again the page property
            .click("coral-buttongroup button:contains('Save & Close')")
            .execTestCase(openPageProperties)
            .click("coral-tab-label:contains('Cloud Services')",{delay:1000})

            .assert.isTrue(function() {
                return h.find("coral-select[name='./cq:cloudserviceconfigs'] span:contains('We.Retail Facebook Social Login')").size() == 1
            })

    ;

    /**
     * Test: Check the Personalization options of a page properties.
     */
    var personalizationPageProperties = new h.TestCase("Personalization page property",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            .click("coral-tab-label:contains('Personalization')",{delay:1000})
            //check if the "Personalization" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Personalization')").size() == 1
            })
            //set the contextHub path
            .fillInput("foundation-autocomplete[name='./cq:contextHubPath'] input.coral-Textfield", contextHubPath)
            //set the segments path
            .fillInput("foundation-autocomplete[name='./cq:contextHubSegmentsPath'] input.coral-Textfield", segmentsPath)
            //add a brand
            .click("button:contains('Add Brand')")
            .click(".groupedServices-ServiceSelector-service-title")

            /*****  Check if the date is saved *****/

            //save the configuration and open again the page property
            .click("coral-buttongroup button:contains('Save & Close')")
            .execTestCase(openPageProperties)
            .click("coral-tab-label:contains('Personalization')",{delay:1000})

            //check the contextHub path
            .assert.isTrue(function(opts){
                return h.find("input[name='./cq:contextHubPath']").val() === contextHubPath
            })
            //check the segments path
            .assert.isTrue(function(opts){
                return h.find("input[name='./cq:contextHubSegmentsPath']").val() === segmentsPath
            })
            //check the brand
            .assert.exist("section.coral-Form-fieldset h4:contains('We.Retail')")
    ;

    /**
     * Test: Check the Add Permissions options of a page properties.
     */
    var addPermissionsPageProperties = new h.TestCase("Add permissions for a page",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
        })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            .click("coral-tab-label:contains('Permissions')",{delay:1000})
            //check if the "Permissions" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Permissions')").size() == 1
            })

            .click("button:contains('Add Permissions')")

            //add permissions for a user
            .fillInput("foundation-autocomplete.js-cq-sites-CreatePermissionsDialog-authorizableList input.coral-Textfield","corecomp", {delayafter:1000})
            //.wait(100)
            .click("foundation-autocomplete.js-cq-sites-CreatePermissionsDialog-authorizableList coral-overlay:contains('corecomp') button")
            //check if the tag for the user was added
            .assert.exist("foundation-autocomplete.js-cq-sites-CreatePermissionsDialog-authorizableList coral-tag[value='corecomp']")
            //check if the Add button is disabled
            .assert.exist(".coral-Dialog-wrapper:contains('Add Permissions') button:contains('Add')[disabled]")

            //add the delete permission
            .click(".coral-Dialog-wrapper:contains('Add Permissions') input[name='delete']")
            //check if Browse, Edit and Delete page checkboxes are checked
            .assert.exist(".coral-Dialog-wrapper:contains('Add Permissions') coral-checkbox[name='read'][checked]")
            .assert.exist(".coral-Dialog-wrapper:contains('Add Permissions') coral-checkbox[name='modify'][checked]")
            .assert.exist(".coral-Dialog-wrapper:contains('Add Permissions') coral-checkbox[name='delete'][checked]")
            //check if the Add button is enabled
            .assert.exist(".coral-Dialog-wrapper:contains('Add Permissions') button:contains('Add')[disabled]", false)

            //add permission
            .click(".coral-Dialog-wrapper:contains('Add Permissions') button:contains('Add')")

            //check if the permission was added to the list
            .assert.isTrue(function(){
                return h.find("table.js-cq-sites-UserGroup-permissions:contains('CoreComponent')").size() == 1
            })
            //check if the permissions were set correctly
            .assert.isTrue(function(){
                return h.find("table.js-cq-sites-UserGroup-permissions:contains('CoreComponent') td:eq(1) coral-icon").size() == 1
            })
            .assert.isTrue(function(){
                return h.find("table.js-cq-sites-UserGroup-permissions:contains('CoreComponent') td:eq(2) coral-icon").size() == 1
            })
            .assert.isTrue(function(){
                return h.find("table.js-cq-sites-UserGroup-permissions:contains('CoreComponent') td:eq(3) coral-icon").size() == 1
            })

            //check if the permission was added to the Effective Permissions list
            .click("button:contains('Effective Permissions')")
            .assert.exist(".cq-siteadmin-admin-properties-effective-permissions:contains('CoreComponent')")
            .click(".coral-Dialog-wrapper:contains('Effective Permissions') button[title='Close']")

            //edit a permission
            .click("table.js-cq-sites-UserGroup-permissions:contains('CoreComponent') button.js-cq-sites-PermissionsProperties-edit")
            //check if Browse, Edit and Delete page checkboxes are checked
            .assert.exist(".coral-Dialog-wrapper:contains('Edit Permissions') coral-checkbox[name='read'][checked]")
            .assert.exist(".coral-Dialog-wrapper:contains('Edit Permissions') coral-checkbox[name='modify'][checked]")
            .assert.exist(".coral-Dialog-wrapper:contains('Edit Permissions') coral-checkbox[name='delete'][checked]")
            //add the publish/unpublish permission
            .click(".coral-Dialog-wrapper:contains('Edit Permissions') input[name='replicate']")
            //save the changes
            .click(".coral-Dialog-wrapper:contains('Edit Permissions') button.js-cq-sites-EditPermissionsDialog-update")
            //check if the permission was added
            .assert.isTrue(function(){
                return h.find("table.js-cq-sites-UserGroup-permissions:contains('CoreComponent') td:eq(4) coral-icon").size() == 1
            })

            //delete permission from the list
            .click("table.js-cq-sites-UserGroup-permissions:contains('CoreComponent') button.js-cq-sites-PermissionsProperties-delete")
            .click("button:contains('Delete')")
            .assert.exist("table.js-cq-sites-UserGroup-permissions:contains('CoreComponent')", false)
        ;

    /**
    * Test: Check the Edit Closed User Group options of a page properties.
    */
    var editUserGroupPermissionsPageProperties = new h.TestCase("Edit user group's permissions for a page",{
        execBefore: tcExecuteBeforeTest,
        execAfter: tcExecuteAfterTest
    })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            .click("coral-tab-label:contains('Permissions')",{delay:1000})
            //check if the "Permissions" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Permissions')").size() == 1
            })

            .click("button:contains('Edit Closed User Group')")

            .fillInput("foundation-autocomplete.js-cq-sites-CUGPermissionsDialog-authorizableList input.coral-Textfield","corecomp",{delayAfter:1000})
            //.wait()
            .click("foundation-autocomplete.js-cq-sites-CUGPermissionsDialog-authorizableList coral-overlay:contains('corecomp') button")
            //check if the tag for the user was added
            .assert.exist("foundation-autocomplete.js-cq-sites-CUGPermissionsDialog-authorizableList coral-tag[value='corecomp']")
            .click(".coral-Dialog-wrapper:contains('Edit Closed') button[title='Remove']")

            //add permissions for a user
            .fillInput("foundation-autocomplete.js-cq-sites-CUGPermissionsDialog-authorizableList input.coral-Textfield","corecomp",{delayAfter:1000})
            //.wait()
            .click("foundation-autocomplete.js-cq-sites-CUGPermissionsDialog-authorizableList coral-overlay:contains('corecomp') button")
            //check if the tag for the user was added
            .assert.exist("foundation-autocomplete.js-cq-sites-CUGPermissionsDialog-authorizableList coral-tag[value='corecomp']")

            .click(".coral-Dialog-wrapper:contains('Edit Closed') button:contains('Save')")

            //check if the permission was added to the list
            .assert.isTrue(function(){
                return h.find("table.js-cq-sites-ClosedUserGroup-permissions:contains('CoreComponent')").size() == 1
            })
            //check if the permissions were set correctly
            .assert.isTrue(function(){
                return h.find("table.js-cq-sites-ClosedUserGroup-permissions:contains('CoreComponent') td:eq(1) coral-icon").size() == 1
            })

            //delete permission from the list
            .click("table.js-cq-sites-ClosedUserGroup-permissions:contains('CoreComponent') button.js-cq-sites-ClosedUserGroup-delete")
            .click("button:contains('Delete')")
            .assert.exist("table.js-cq-sites-ClosedUserGroup-permissions:contains('CoreComponent')", false)

    ;

    /**
    * Test: Check the Effective Permissions options of a page properties.
    */
    var effectivePermissionsPageProperties = new h.TestCase("Effective permissions for a page",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
    })
            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            .click("coral-tab-label:contains('Permissions')",{delay:1000})
            //check if the "Permissions" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Permissions')").size() == 1
            })

            //open the effective permissions option
            .click("button:contains('Effective Permissions')")
            .click(".coral-Dialog-wrapper:contains('Effective Permissions') button[title='Close']")
    ;

    /**
     * Test: Check the Blueprint options of a page properties.
     */
    var blueprintPageProperties = new h.TestCase("Blueprint for a page",{
        execBefore: tcExecuteBeforeTest,
        execAfter: tcExecuteAfterTest
    })
            .execFct(function (opts,done) {
                c.createBlueprintConfig(h.param("testPagePath")(opts), "coreComp_blueprint",done)
            })
            // create the live copy page, store page path in 'testLiveCopyPagePath'
            .execFct(function (opts,done) {
                c.createLiveCopy(h.param("testPagePath")(opts), c.rootPage ,'page_' + Date.now(),'page_' + Date.now(),"testLiveCopyPagePath",done)
            })

            // open the new page in the sites
            .navigateTo("/sites.html%testPagePath%")

            .execTestCase(openPageProperties)

            .click("coral-tab-label:contains('Blueprint')",{delay:1000})
            //check if the "Blueprint" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Blueprint')").size() == 1
            })

            .click("coral-anchorbutton-label:contains('Rollout')")
            //check if the page is selected
            .assert.isTrue(function(){
                return h.find("coral-checkbox.select-rollout[checked]").size() == 2
            })
            //check the Rollout page and all sub pages
            .click("coral-checkbox.coral-Form-field")
            //save the configuration
            .click(".cq-dialog-actions .cq-dialog-submit")

            // delete the test page we created for the live copy
            .execFct(function (opts, done) {
                c.deletePage(h.param("testLiveCopyPagePath")(opts), done);
            })

            // delete the blueprint
            .execFct(function (opts, done) {
                c.deleteBlueprint("/etc/blueprints/corecomp_blueprint", done);
            })
    ;

    /**
     * Test: Check the Live Copy options of a page properties.
     */
    var liveCopyPageProperties = new h.TestCase("Live Copy for a page",{
            execBefore: tcExecuteBeforeTest,
            execAfter: tcExecuteAfterTest
    })
            // create the live copy page, store page path in 'testLiveCopyPagePath'
            .execFct(function (opts,done) {
                c.createLiveCopy(h.param("testPagePath")(opts), c.rootPage ,'page_' + Date.now(),'page_' + Date.now(),"testLiveCopyPagePath",done)
            })

            // open the new page in the sites
            .navigateTo("/sites.html%testLiveCopyPagePath%")

            //select the page
            .execFct(function(opts, done){
                c.setPageName(h.param("testLiveCopyPagePath")(opts),"testPageName",done);
            })
            .click('coral-columnview-item:contains("%testPageName%") coral-columnview-item-thumbnail')
            .click("button.cq-siteadmin-admin-actions-properties-activator")

            .click("coral-tab-label:contains('Live Copy')",{delay:1000})
            //check if the "Live Copy" option was selected
            .assert.isTrue(function() {
                return h.find("coral-tab.is-selected coral-tab-label:contains('Live Copy')").size() == 1
            })

            //check the Synchronize button
            .click("coral-actionbar-item:contains('Synchronize') button")
            .click(".coral-Button--primary:contains('Sync')")

            //check the Reset button
            .click("coral-tab-label:contains('Live Copy')",{delay:1000})
            .click("coral-actionbar-item:contains('Reset') button")
            .click(".coral-Button--warning:contains('Reset')")

            //check the Suspend button
            .click("coral-tab-label:contains('Live Copy')",{delay:1000})
            .click("coral-actionbar-item:contains('Suspend') button")
            .click(function() {
                return h.find("coral-anchorlist coral-list-item-content").eq(0)
            })
            .click(".coral-Button--warning:contains('Suspend')")

            //check the Resume button
            .click("coral-tab-label:contains('Live Copy')",{delay:1000})
            .click("coral-actionbar-item:contains('Resume') button")
            .click(".coral-Button--warning:contains('Resume')")

            .click("coral-tab-label:contains('Live Copy')",{delay:1000})
            .click("coral-actionbar-item:contains('Suspend') button")
            .click(function() {
                return h.find("coral-anchorlist coral-list-item-content").eq(1)
            })
            .click(".coral-Button--warning:contains('Suspend')")

            //check the Detach button
            .click("coral-tab-label:contains('Live Copy')",{delay:1000})
            .click("coral-actionbar-item:contains('Detach') button")
            .click(".coral-Button--warning:contains('Detach')")

            // delete the test page we created for live copy
            .execFct(function (opts, done) {
                c.deletePage(h.param("testLiveCopyPagePath")(opts), done);
            })
    ;

    /**
     * The main test suite for Page component
     */
    new h.TestSuite("Core Components - Page v2", {path:"/apps/core/wcm/tests/core-components-it/v2/Page.js",
        execBefore:c.tcExecuteBeforeTestSuite,
        execInNewWindow : false})

        .addTestCase(basicTitleAndTagsPageProperties)
        .addTestCase(basicTitlesAndDescriptionsPageProperties)
        .addTestCase(basicOnOffTimePageProperties)
        .addTestCase(basicVanityUrlPageProperties)
        .addTestCase(advancedSettingsPageProperties)
        .addTestCase(advancedTemplatesSettingsPageProperties)
        .addTestCase(advancedAuthenticationPageProperties)
        .addTestCase(advancedExportPageProperties)
        .addTestCase(thumbnailPageProperties)
        .addTestCase(socialMediaPageProperties)
        .addTestCase(cloudServicesPageProperties)
        .addTestCase(personalizationPageProperties)
        .addTestCase(addPermissionsPageProperties)
        .addTestCase(editUserGroupPermissionsPageProperties)
        .addTestCase(effectivePermissionsPageProperties)
        .addTestCase(blueprintPageProperties)
        .addTestCase(liveCopyPageProperties)
    ;

}(hobs, jQuery));

