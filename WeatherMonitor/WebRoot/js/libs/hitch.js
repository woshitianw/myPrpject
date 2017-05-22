/**
 * @author haoml
 * @date 2016/5/16
 */
define([
    "jquery"
], function ($) {
    $.hitch = function (scope, method) {
        // summary: Create a function that will only ever execute in a given scope
        if (!method) {
            method = scope;
            scope = null;
        }
        if (typeof method == "string") {
            scope = scope || window;
            if (!scope[method]) {
                throw(['method not found']);
            }
            return function () {
                return scope[method].apply(scope, arguments || []);
            };
        }
        return !scope ? method : function () {
            return method.apply(scope, arguments || []);
        };
    };
});