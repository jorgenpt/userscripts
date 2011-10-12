// ==UserScript==
// @name          Misc JIRA Fixes
// @namespace     http://github.com/jorgenpt/userscripts/
// @description   Various fixes for JIRA, like removing optgroups from the assign dropdowns (Since Google Chrome won't let you type-to-complete optgroups).
// @include       https://*.onjira.com/*
//
// @version       0.1.1
// @author        jorgenpt
// ==/UserScript==

var domChangeTimer = null;
fixupSelects();

function fixupSelects()
{
    domChangeTimer = null;

    // We disable the event listener while we execute, so we don't trigger ourselves. :-)
    document.removeEventListener("DOMSubtreeModified", fixupSelectsWithDelay, false);

    var separator = document.createElement("option");
    separator.setAttribute("disabled", "1");

    var selects = document.getElementsByClassName("select");
    for (var i = 0; i < selects.length; ++i)
    {
        var select = selects[i];
        if (select.name != "assignee")
            continue;

        var groups = select.getElementsByTagName("optgroup");
        while (groups.length > 0)
        {
            var group = groups[0];

            var newSeparator = separator.cloneNode(true);
            newSeparator.innerHTML = group.getAttribute("label");
            select.insertBefore(newSeparator, group);

            // Reparent each child of this optgroup.
            var children = group.children;
            while (children.length > 0)
            {
                var child = children[0];
                group.removeChild(child);
                select.insertBefore(child, group);
            }

            select.removeChild(group);
        }
    }

    document.addEventListener("DOMSubtreeModified", fixupSelectsWithDelay, false);
}

function fixupSelectsWithDelay(event)
{
    // This is to allow batching of multiple dom change events.
    if (typeof(domChangeTimer) == "number")
    {
        clearTimeout(domChangeTimer);
        domChangeTimer = null;
    }

    // Events less than 250ms apart are batches.
    domChangeTimer = setTimeout(fixupSelects, 250);
}
