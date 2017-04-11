/*******************************************************************************
 * Copyright 2017 Adobe Systems Incorporated
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

/**
 * The Design dialog:
 * - Provides check boxes for all possible sizes (H1-H6)
 * - Provides a select field to define the default value from the selected sizes:
 *   options are added/removed based on the status of the size checkboxes
 * - Validation: if no size checkboxes are checked, the dialog cannot be saved

 */
(function ($, Granite, ns, $document) {

    var DEFAULT_SIZE_SELECTOR       = "coral-select.core-title-size-default",
        ALLOWED_SIZES_SELECTOR      = ".core-title-sizes-allowed coral-checkbox",
        DATA_ATTR_VALIDATION_STATE  = "checkboxes.validation.state";

    function updateDefaultSizeSelect(checkboxToggled) {

        var select = $(DEFAULT_SIZE_SELECTOR).get(0),
            $checkboxes = $(ALLOWED_SIZES_SELECTOR),
            checkedTotal = 0,
            firstCheckedValue = "",
            selectValue = "";

        if (select === null || select === undefined) {
            return;
        }

        // clear the select items to work around a Coral.Select issue (CUI-5584)
        select.items.clear();

        // for each checked checkbox, add an option to the default sizes dropdown
        $checkboxes.each(function (i, checkbox) {
            if (checkbox.checked) {
                var newItem = new Coral.Select.Item();
                newItem.content.textContent = checkbox.label.innerHTML;
                newItem.value = checkbox.value;
                select.items.add(newItem);
                checkedTotal++;
            }
        });

        // get the value of the first checked box
        $checkboxes.each(function (i, checkbox) {
            if (checkbox.checked) {
                firstCheckedValue = checkbox.value;
                return false;
            }
        });

        // set the default value of the size dropdown
        if (checkboxToggled) {
            // the default value is the first checked box
            selectValue = firstCheckedValue;
        } else {
            // the default value is read from the repository
            selectValue = select.value;
        }

        // hide/show the select
        // Note: we use Coral.commons.nextFrame to make sure that the select widget has been updated
        Coral.commons.nextFrame(function() {
            select.value = selectValue;
            if (checkedTotal == 0 || checkedTotal == 1) {
                $(select).parent().hide();
            } else {
                $(select).parent().show();
            }
        });
    }

    // update the default size select when an allowed size is checked/unchecked
    $document.on("change", ALLOWED_SIZES_SELECTOR, function(e) {
        updateDefaultSizeSelect(true);
    });

    // update the default size select when the design title dialog is opened
    $document.on("foundation-contentloaded", function (e) {
        Coral.commons.ready($(ALLOWED_SIZES_SELECTOR), function(component) {
            updateDefaultSizeSelect(false);
        });
    });

    // Display an error if all checkboxes are empty
    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        selector: ALLOWED_SIZES_SELECTOR,
        validate: function(el) {

            var $checkboxes = $(el).parent().children(ALLOWED_SIZES_SELECTOR);
            var firstEl = $checkboxes.get(0);
            var isValid = $(firstEl).data(DATA_ATTR_VALIDATION_STATE);
            var validationDone = isValid !== undefined;

            // if the validation has already been done, we get the status from the first checkbox
            if (validationDone) {
                $(firstEl).removeData(DATA_ATTR_VALIDATION_STATE);
                if (!isValid) {
                    return Granite.I18n.get("Select at least one size option.");
                } else {
                    return;
                }
            }

            // set the validation status on the first checkbox
            isValid = false;
            $checkboxes.each(function (i, checkbox) {
                if (checkbox.checked) {
                    isValid = true;
                    return false;
                }
            });
            $(firstEl).data(DATA_ATTR_VALIDATION_STATE, isValid);

            // trigger the validation on the first checkbox
            var api = $(firstEl).adaptTo("foundation-validation");
            api.checkValidity();
            api.updateUI();
        }
    });

}(jQuery, Granite, Granite.author, jQuery(document)));