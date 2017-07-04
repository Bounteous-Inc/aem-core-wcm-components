/*
 *  Copyright 2016 Adobe Systems Incorporated
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

window.CQ.CoreComponentsIT.v1.FormHidden = window.CQ.CoreComponentsIT.v1.FormHidden || {}

/**
 * Tests for core form option
 */
;(function(h, $){

    //shortcut
    var c = window.CQ.CoreComponentsIT.commons;
    var formHiddenV1 = window.CQ.CoreComponentsIT.v1.FormHidden;

    /**
     * v2 specifics
     */
    var tcExecuteBeforeTest = formHiddenV1.tcExecuteBeforeTest(c.rtFormHidden_v2, "core/wcm/sandbox/tests/components/test-page-v2");
    var tcExecuteAfterTest = formHiddenV1.tcExecuteAfterTest();

    /**
     * The main test suite.
     */
    new h.TestSuite('Core Components - Form Hidden v2', {path: '/apps/core/wcm/tests/core-components-it/FormHidden.js',
        execBefore:c.tcExecuteBeforeTestSuite,
        execInNewWindow : false})

        .addTestCase(formHiddenV1.checkMandatoryFields(tcExecuteBeforeTest, tcExecuteAfterTest))
        .addTestCase(formHiddenV1.setElementName(tcExecuteBeforeTest, tcExecuteAfterTest))
        .addTestCase(formHiddenV1.setElementValue(tcExecuteBeforeTest, tcExecuteAfterTest))
        .addTestCase(formHiddenV1.setElementId(tcExecuteBeforeTest, tcExecuteAfterTest))
    ;

})(hobs, jQuery);