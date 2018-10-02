﻿function Meganav($scope, meganavResource) {

    $scope.items = [];
    
    if (!_.isEmpty($scope.model.value)) {
        // retreive the saved items
        $scope.items = $scope.model.value;

        // get updated entities for content
        getItemEntities($scope.items);
    }

    $scope.add = function () {
        openSettings(null, function (model) {
            // add item to scope
            $scope.items.push(buildNavItem(model.value));
        });
    };

    $scope.edit = function (item) {
        openSettings(item, function (model) {
            // update item in scope
            // assign new values via extend to maintain refs
            angular.extend(item, buildNavItem(model.value));
        });
    };

    $scope.remove = function (item) {
        item.remove();
    };

    $scope.isVisible = function (item) {
        return $scope.model.config.removeNaviHideItems == true ? item.naviHide !== true : true;
    };

    $scope.$on("formSubmitting", function (ev, args) {
        $scope.model.value = $scope.items;
    });

    function getItemEntities (items) {
        _.each(items, function (item) {
            if (item.id) {
                meganavResource.getById(item.id).then(function (response) {
                    angular.extend(item, response.data);
                });

                if (item.children.length > 0) {
                    getItemEntities(item.children);
                }
            }
        });
    }

    function openSettings (item, callback) {
        // assign value to new empty object to break refs
        // prevent accidentally changing old values
        $scope.settingsOverlay = {
            title: "Settings",
            view: "/App_Plugins/Meganav/Views/settings.html",
            show: true,
            value: angular.extend({}, item),
            submit: function (model) {
                !callback || callback(model);
                // close settings
                closeSettings();
            }
        }
    }

    function closeSettings () {
        $scope.settingsOverlay.show = false;
        $scope.settingsOverlay = null;
    }

    function buildNavItem(data) {

        return {
            id: data.nodeType.value === "item" ? data.id : undefined,
            name: data.nodeType.value === "item" ? data.name : undefined,
            title: data.nodeType.value === "seperator" ? "--seperator--" : data.title,
            target: data.nodeType.value === "item" ? data.target : undefined,
            url: data.nodeType.value === "item" ? data.url || "#" : undefined,
            children: data.children || [],
            icon: data.nodeType.value === "seperator"
                ? "icon-remove"
                : data.nodeType.value === "label"
                ? "icon-tag"
                : (data.icon || "icon-link"),
            published: true,
            naviHide: data.naviHide,
            nodeType: data.nodeType,
            nodeTypeSimple: data.nodeType.value
        }

    }
}

angular.module("umbraco").controller("Cogworks.Meganav.MeganavController", Meganav);

app.requires.push("ui.tree");