(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define(['jquery', 'underscore'], function($, _){
            return factory($, _);

        });
    }else{
        root.tabler.promisable = factory(root.jQuery, root._);
    }
})(this, function($, _){
    'use strict';

    function Promisable(options){
        _.extend(this, options || {});
    }

    Promisable.pluginName = 'promisable';

    _.extend(Promisable.prototype, {
        attach: function(table){
            this.table = table;

            var concatTagStrings = this.originalConcatTagStrings = table.concatTagStrings;
            table.concatTagStrings = function(builder, tag, text) {
                return (new Promise(text)).then(concatTagStrings.bind(this, builder, tag));
            };

            var updateCells = this.originalUpdateCells = table.updateCells;
            table.updateCells = function($tds, cellIndex, cell) {
                return (new Promise(cell)).then(updateCells.bind(this, $tds, cellIndex));
            };

            var renderTableSections = this.originalRenderTableSections = table.renderTableSections;
            table.renderTableSections = function(tableSections) {
                return Promise.all(tableSections).then(renderTableSections.bind(this));
            };

            var joinBodyStrings = this.originalJoinBodyStrings = table.joinBodyStrings;
            table.joinBodyStrings = function(body) {
                return (new Promise(body)).then(joinBodyStrings.bind(this));
            };

            var joinRowCells = this.originalJoinRowCells = table.joinRowCells;
            table.joinRowCells = function(row, cells) {
                return Promise.all(cells).then(joinRowCells.bind(this, row));
            };
        },

        detach: function(table){
            table.concatTagStrings = this.originalConcatTagStrings;
            this.originalConcatTagStrings = undefined;

            table.updateCells = this.originalUpdateCells;
            this.originalUpdateCells = undefined;

            table.renderTableSections = this.originalRenderTableSections;
            this.originalRenderTableSections = undefined;

            table.joinBodyStrings = this.originalJoinBodyStrings;
            this.originalJoinBodyStrings = undefined;

            table.joinRowCells = this.originalJoinRowCells;
            this.originalJoinRowCells = undefined;
        }
    });

    return Promisable;
});
