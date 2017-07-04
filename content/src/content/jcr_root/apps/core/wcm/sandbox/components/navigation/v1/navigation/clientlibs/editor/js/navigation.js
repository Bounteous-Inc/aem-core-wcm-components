/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~ Copyright 2017 Adobe Systems Incorporated
 ~
 ~ Licensed under the Apache License, Version 2.0 (the 'License');
 ~ you may not use this file except in compliance with the License.
 ~ You may obtain a copy of the License at
 ~
 ~     http://www.apache.org/licenses/LICENSE-2.0
 ~
 ~ Unless required by applicable law or agreed to in writing, software
 ~ distributed under the License is distributed on an 'AS IS' BASIS,
 ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ~ See the License for the specific language governing permissions and
 ~ limitations under the License.
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
(function ($) {
    'use strict';

    var COLLECT_ALL_PAGES_SELECTOR = 'coral-checkbox.cmp-navigation__editor-collect',
        MAX_DEPTH_SELECTOR = '.cmp-navigation__editor-maxDepth',
        MAX_DEPTH_INPUT_SELECTOR = '.cmp-navigation__editor-maxDepth > coral-numberinput[name="./maxDepth"]';

    function toggleInputs(collectAllPages) {
        if (collectAllPages) {
            if (collectAllPages.checked) {
                $(MAX_DEPTH_SELECTOR).addClass('hide');
                $(MAX_DEPTH_INPUT_SELECTOR).val(-1);
            } else {
                $(MAX_DEPTH_SELECTOR).removeClass('hide');
            }
        } else {
            var maxDepth = $(MAX_DEPTH_INPUT_SELECTOR).val();
            if (maxDepth === '-1') {
                $(COLLECT_ALL_PAGES_SELECTOR).prop('checked', true);
                $(MAX_DEPTH_SELECTOR).addClass('hide');
            }
        }
    }


    $(document).on('coral-component:attached', MAX_DEPTH_SELECTOR, function() {
        toggleInputs();
    });

    $(document).on('change', COLLECT_ALL_PAGES_SELECTOR, function(e) {
        toggleInputs(e.target);
    });
})(jQuery);
