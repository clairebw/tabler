define([
        'lib/tabler/tabler',
        'lib/tabler/tabler.columnGrouper',
        'lib/tabler/tabler.aggregator',
        'lib/tabler/tabler.toggleColumns',
        'lib/tabler/tabler.sortable',
        'lib/tabler/tabler.pager',
        'lib/tabler/tabler.pageSize',
        'lib/tabler/tabler.jumpToPage',
        'lib/tabler/tabler.removeColumns',
	'lib/tabler/tabler.infiniTable'],
    function(tabler,
        columnGrouper,
        aggregator,
        toggleColumns,
        sortable,
        pager,
        pageSize,
        jumpToPage,
        removeColumns,
	infiniTable){
    'use strict';
    describe('tabler', function(){
        var table;
        afterEach(function(){
            if(table){
                table.destroy();
                table = undefined;
            }
        });
        describe('rendering', function(){
            it('gives the table a class if specified', function(){
                table = tabler.create(null, {className: 'testClass'});

                expect(table.$el.hasClass('testClass')).toEqual(true);
            });

            it('uses the first argument to create as options if its an object', function(){
                table = tabler.create({className: 'testClass'});

                expect(table.$el.hasClass('testClass')).toEqual(true);
            });

            it('renders as a table with rows from results', function(){
                table = tabler.create();

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'},
                    {column1: 'column 1b', column2: 'column 2b'}
                ]);

                table.render();

                expect(table.$el[0].nodeName.toLowerCase()).toEqual('table');
                expect(table.$('tr').length).toEqual(2);
                expect(table.$('tr').eq(0).find('td').length).toEqual(2);
                expect(table.$('tr').eq(0).find('td').eq(0).text()).toEqual('column 1a');
                expect(table.$('tr').eq(0).find('td').eq(1).text()).toEqual('column 2a');
                expect(table.$('tr').eq(1).find('td').eq(0).text()).toEqual('column 1b');
                expect(table.$('tr').eq(1).find('td').eq(1).text()).toEqual('column 2b');
            });
            it('will only render the fields given in the spec, when there is a spec', function(){
                table = tabler.create([
                    {field: 'column1'}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'},
                    {column1: 'column 1b', column2: 'column 2b'}
                ]);

                table.render();

                expect(table.$('tr').eq(0).find('td').length).toEqual(1);
                expect(table.$('tr').eq(0).find('td').eq(0).text()).toEqual('column 1a');
                expect(table.$('tr').eq(1).find('td').eq(0).text()).toEqual('column 1b');
            });
            it('can have default values for columns', function(){
                table = tabler.create([
                    {field: 'column1', defaultText: 'n/a'}
                ]);

                table.load([
                    {column1: 'column 1a'},
                    {column1: ''},
                    {column1: undefined},
                    {column1: null},
                    {column1: NaN},
                    {column1: false},
                    {column1: 0}
                ]);

                table.render();

                expect(table.$('tr').eq(0).find('td').eq(0).text()).toEqual('column 1a');
                expect(table.$('tr').eq(1).find('td').eq(0).text()).toEqual('n/a');
                expect(table.$('tr').eq(2).find('td').eq(0).text()).toEqual('n/a');
                expect(table.$('tr').eq(3).find('td').eq(0).text()).toEqual('n/a');
                expect(table.$('tr').eq(4).find('td').eq(0).text()).toEqual('n/a');
                expect(table.$('tr').eq(5).find('td').eq(0).text()).toEqual('false');
                expect(table.$('tr').eq(6).find('td').eq(0).text()).toEqual('0');
            });
            it('does not allow duplicate fieldnames', function(){
                var err;
                try{
                    tabler.create([
                        {field: 'column1'},
                        {field: 'column1'}
                    ]);
                }catch(e){
                    err = e;
                }
                expect(err).toBeDefined();
            });
            it('allows duplicate fieldnames when one field has a unique "id" attribute', function(){
                var err;
                try{
                    tabler.create([
                        {field: 'column1'},
                        {id: 'column1_id', field: 'column1'}
                    ]);
                }catch(e){
                    err = e;
                }

                expect(err).not.toBeDefined();
            });
            it('does not allow duplicate ids', function(){
                var err;
                try{
                    tabler.create([
                        {id: 'id', field: 'column2'},
                        {id: 'id', field: 'column2'}
                    ]);
                }catch(e){
                    err = e;
                }
                expect(err).toBeDefined();
            });
            it('does not allow specs without an id or field', function(){
                var err;
                try{
                    tabler.create([
                        {}
                    ]);
                }catch(e){
                    err = e;
                }
                expect(err).toBeDefined();
            });
            it('allows specs to be added via the addToSpec method', function(){
                table = tabler.create([]);

                table.addToSpec({field: 'column1'});

                expect(table.spec[0]).toEqual({id: 'column1', field: 'column1'});
            });
            it('allows specs to be removed via the removeFromSpec method', function(){
                table = tabler.create([
                    {id: 'column1', field: 'column1'}
                ]);

                table.removeFromSpec('column1');

                expect(table.spec.length).toEqual(0);
            });
            it('allows you to pull out column specs by fieldName', function(){
                var field;

                table = tabler.create([
                    {field: 'column1', name: 'testing', prop: 'customValue'}
                ]);

                field = table.getField('column1');

                expect(field).toEqual({field: 'column1', name: 'testing', prop: 'customValue', id: 'column1'});
            });
            it('allows you to pull out column specs by id', function(){
                var field;

                table = tabler.create([
                    {id: 'id', field: 'column1', name: 'testing', prop: 'customValue'}
                ]);

                field = table.getField('id');

                expect(field).toEqual({id: 'id', field: 'column1', name: 'testing', prop: 'customValue'});
            });
            it('allows you to pull out column specs by other attributes on their own', function(){
                var field;

                table = tabler.create([
                        {id: 1, field: 'column1', name: 'testing', prop: 'other'},
                        {id: 2, field: 'column1', name: 'testing', prop: 'customValue'},
                        {id: 3, field: 'column1', name: 'testing', prop: 'yetAnother'}
                    ]);

                field = table.getField({prop: 'customValue'});

                expect(field).toEqual({id: 2, field: 'column1', name: 'testing', prop: 'customValue'});
            });
            it('builds thead and th elements with labels and classes as defined in spec', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1', headerClassName: 'column1Class'},
                    {field: 'column2', name: 'Column 2', headerClassName: 'column2Class'}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'},
                    {column1: 'column 1b', column2: 'column 2b'}
                ]);

                table.render();

                expect(table.$('thead').length).toEqual(1);
                expect(table.$('thead tr').length).toEqual(1);
                expect(table.$('thead th').length).toEqual(2);
                expect(table.$('thead th').eq(0).text().trim()).toEqual('Column 1');
                expect(table.$('thead th').eq(1).text().trim()).toEqual('Column 2');
                expect(table.$('thead th').eq(0).hasClass('column1Class')).toEqual(true);
                expect(table.$('thead th').eq(1).hasClass('column2Class')).toEqual(true);
                expect(table.$('tbody tr').length).toEqual(2);
            });
            it('builds columns with custom header text', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1', title: 'First Column'}
                ]);

                table.load([
                    {column1: 'column 1a'},
                    {column1: 'column 1b'}
                ]);

                table.render();

                expect(table.$('thead th').length).toEqual(1);
                expect(table.$('thead th').eq(0).text().trim()).toEqual('First Column');
            });
            it('builds columns with custom header text even when that text is an empty string', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1', title: ''}
                ]);

                table.load([
                    {column1: 'column 1a'},
                    {column1: 'column 1b'}
                ]);

                table.render();

                expect(table.$('thead th').length).toEqual(1);
                expect(table.$('thead th').eq(0).text().trim()).toEqual('');
            });
            it('can give columns a width and a CSS class', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1', width: '25%'},
                    {field: 'column2', name: 'Column 2', className: 'testing'}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'},
                    {column1: 'column 1b', column2: 'column 2b'}
                ]);
                table.render();

                expect(table.$('thead').length).toEqual(1);
                expect(table.$('thead th').eq(0).attr('width')).toEqual('25%');
                expect(table.$('thead th').eq(1).attr('width')).not.toBeTruthy();
                expect(table.$('thead th').eq(0).attr('class')).not.toBeTruthy();
                expect(table.$('thead th').eq(1).attr('class')).toEqual('testing');

                expect(table.$('tbody tr').eq(0).find('td').eq(1).attr('class')).toEqual('testing');
                expect(table.$('tbody tr').eq(1).find('td').eq(1).attr('class')).toEqual('testing');
            });
            it('can have disabled columns that do not render', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1', disabled: true},
                    {field: 'column2', name: 'Column 2'}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'},
                    {column1: 'column 1b', column2: 'column 2b'}
                ]);

                table.render();

                expect(table.$('thead tr').length).toEqual(1);
                expect(table.$('thead tr th').length).toEqual(1);
                expect(table.$('thead tr th').text()).toEqual('Column 2');

                expect(table.$('tbody tr').length).toEqual(2);
                expect(table.$('tbody tr').eq(0).find('td').length).toEqual(1);
                expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('column 2a');
                expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('column 2b');
            });
            it('can have formatter functions on headings', function(){
                var formatter = sinon.spy(function(columnSpec){
                        return '<span>' + columnSpec.field + '</span>';
                    });
                
                table = tabler.create([
                    {field: 'column1', headerFormatter: formatter}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a', column3: 'column 3a'},
                    {column1: 'column 1b', column2: 'column 2b', column3: 'column 3a'}
                ]);
                table.render();

                expect(formatter.calledOnce).toEqual(true);
                expect(formatter.args[0][0]).toEqual(table.spec[0]);
                expect(table.$('thead tr th').eq(0).html().toLowerCase()).toEqual('<span>column1</span>');
            });
            it('can have formatter functions on cells', function(){
                var formatter = sinon.spy(function(value){
                        return '<a href="#">' + value + '</a>';
                    });
                
                table = tabler.create([
                    {field: 'column1', formatter: formatter}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a', column3: 'column 3a'},
                    {column1: 'column 1b', column2: 'column 2b', column3: 'column 3a'}
                ]);
                table.render();

                expect(formatter.calledTwice).toEqual(true);
                expect(formatter.alwaysCalledOn(table)).toEqual(true);
                expect(formatter.args[0][0]).toEqual('column 1a');
                expect(formatter.args[0][1]).toEqual(table.spec[0]);
                expect(formatter.args[0][2]).toEqual(table._data.items[0]);
                expect(formatter.args[0][3]).toEqual(0);
                expect(table.$('tr').eq(0).find('td').eq(0).html().toLowerCase()).toEqual('<a href="#">column 1a</a>');
                expect(table.$('tr').eq(1).find('td').eq(0).html().toLowerCase()).toEqual('<a href="#">column 1b</a>');
            });
            it('cleans up on destroy', function(){
                var clickSpy = sinon.spy();
                
                table = tabler.create();

                table.load([
                    {column1: 'column 1a', column2: 'column 2a', column3: 'column 3a'},
                    {column1: 'column 1b', column2: 'column 2b', column3: 'column 3a'}
                ]);
                table.render();

                table.$el.click(clickSpy);

                table.destroy();
                table.$el.click();

                expect(table.$el.is(':empty')).toEqual(true);
                expect(clickSpy.called).toEqual(false);
            });
        });
        describe('dynamic data', function(){
            it('calls "fetch" method on render if specified', function(){
                var fetchSpy = sinon.spy(),
                    table = tabler.create({
                        fetch: fetchSpy
                    });

                table.render();

                expect(fetchSpy.calledOnce).toEqual(true);
                expect(fetchSpy.args[0][0]).toEqual({});
            });
            it('has "loading" class on table while waiting for fetch', function(){
                var fetchSpy = sinon.spy(),
                    table = tabler.create({
                        fetch: fetchSpy
                    });

                table.render();

                expect(table.$el.hasClass('loading')).toEqual(true);
            });
            it('renders table with fetched data when fetch returns', function(){
                var fetchSpy = sinon.spy(),
                    table = tabler.create({
                        fetch: fetchSpy
                    });

                table.render();
                fetchSpy.args[0][1]({
                    items: [
                        {column1: 'Column 1 Value 1', column2: 'Column 2 Value 1'}
                    ]
                });

                expect(table.$('tr').length).toEqual(1);
                expect(table.$('tr td').eq(0).text()).toEqual('Column 1 Value 1');
                expect(table.$('tr td').eq(1).text()).toEqual('Column 2 Value 1');
            });
            it('removes "loading" class on table when fetch returns', function(){
                var fetchSpy = sinon.spy(),
                    table = tabler.create({
                        fetch: fetchSpy
                    });

                table.render();
                fetchSpy.args[0][1]({
                    items: [
                        {column1: 'Column 1 Value 1', column2: 'Column 2 Value 1'}
                    ]
                });

                expect(table.$el.hasClass('loading')).toEqual(false);
            });
        });
        describe('plugins', function(){
            it('can create with plugins', function(){
                function TestPlugin(options){
                    this.options = options;
                }
                TestPlugin.pluginName = 'testPlugin';
                TestPlugin.prototype.attach = sinon.spy();

                table = tabler.create([], {plugins: [TestPlugin], testPlugin: {property1: true}});

                expect(table.testPlugin).toBeDefined();
                expect(TestPlugin.prototype.attach.calledOnce).toEqual(true);
                expect(TestPlugin.prototype.attach.args[0][0]).toEqual(table);
                expect(table.testPlugin.options).toEqual({property1: true});
            });
            it('can add plugins', function(){
                table = tabler.create();

                function TestPlugin(options){
                    this.options = options;
                }
                TestPlugin.pluginName = 'testPlugin';
                TestPlugin.prototype.attach = sinon.spy();

                table.addPlugin(TestPlugin, {config: 'value'});

                expect(table.testPlugin).toBeDefined();
                expect(table.testPlugin.options).toEqual({config: 'value'});
                expect(TestPlugin.prototype.attach.calledOnce).toEqual(true);
                expect(TestPlugin.prototype.attach.args[0][0]).toEqual(table);
            });
            describe('aggregator', function(){
                it('adds footer row with totals', function(){
                    var totaliser = sinon.spy(function(memo, value){
                            memo = memo + value;
                            return memo;
                        });
                    table = tabler.create([
                        {field: 'column1', aggregator: totaliser}
                    ], {plugins: [aggregator]});

                    table.load([
                        {column1: 2},
                        {column1: 4}
                    ]);
                    table.render();

                    expect(totaliser.calledTwice).toEqual(true);
                    expect(table.$('tfoot').length).toEqual(1);
                    expect(table.$('tfoot td').length).toEqual(1);
                    expect(table.$('tfoot td').text()).toEqual('6');
                });
                it('can have text instead of total in footer cell', function(){
                    var totaliser = sinon.spy(function(memo, value){
                            memo = (memo || 0) + value;
                            return memo;
                        });
                    table = tabler.create([
                        {field: 'column1', aggregatorText: 'Total'},
                        {field: 'column2', aggregator: totaliser}
                    ], {plugins: [aggregator]});

                    table.load([
                        {column1: 'Thing 1', column2: 2},
                        {column1: 'Thing 2', column2: 4}
                    ]);
                    table.render();

                    expect(totaliser.calledTwice).toEqual(true);
                    expect(table.$('tfoot').length).toEqual(1);
                    expect(table.$('tfoot td').eq(0).text()).toEqual('Total');
                    expect(table.$('tfoot td').eq(1).text()).toEqual('6');
                });
                it('adds classNames to footer row cells', function(){
                    var totaliser = sinon.spy(function(memo, value){
                            memo = memo + value;
                            return memo;
                        });
                    table = tabler.create([
                        {field: 'column1', className: 'firstColumn', aggregatorText: 'Total'},
                        {field: 'column2', className: 'secondColumn', aggregator: totaliser}
                    ], {plugins: [aggregator]});

                    table.load([
                        {column1: 2},
                        {column1: 4}
                    ]);
                    table.render();

                    expect(table.$('tfoot td').eq(0).hasClass('firstColumn')).toEqual(true);
                    expect(table.$('tfoot td').eq(1).hasClass('secondColumn')).toEqual(true);
                });
            });
            describe('columnGrouper', function(){
                it('can group column headers', function(){
                    table = tabler.create([
                        {field: 'column1', name: 'Column 1'},
                        {field: 'column2', name: 'Column 2', groupName: 'Group 1'},
                        {field: 'column3', name: 'Column 3', groupName: 'Group 1'},
                        {field: 'column4', name: 'Column 4'}
                    ], {plugins: [columnGrouper]});

                    table.load([
                        {column1: 'column 1a', column2: 'column 2a', column3: 'column 3a', column4: 'column 4a'},
                        {column1: 'column 1b', column2: 'column 2b', column3: 'column 3b', column4: 'column 4b'}
                    ]);
                    table.render();

                    expect(table.$('thead').length).toEqual(1);
                    expect(table.$('thead tr').length).toEqual(2);
                    expect(table.$('thead tr:first').attr('class')).toEqual('columnGroups');
                    expect(table.$('thead tr:first th').length).toEqual(3);
                    expect(table.$('thead tr:first th').eq(0).attr('colspan')).toEqual('1');
                    expect(table.$('thead tr:first th').eq(0).text()).toEqual('');
                    expect(table.$('thead tr:first th').eq(1).attr('colspan')).toEqual('2');
                    expect(table.$('thead tr:first th').eq(1).text()).toEqual('Group 1');
                    expect(table.$('thead tr:first th').eq(1).attr('class')).toEqual('group-1');
                    expect(table.$('thead tr:first th').eq(2).attr('colspan')).toEqual('1');
                    expect(table.$('thead tr:first th').eq(2).text()).toEqual('');
                });
                it('can have formatters for column groups', function(){
                    table = tabler.create([
                        {field: 'column1', name: 'Column 1', groupName: 'Group 1'},
                        {field: 'column2', name: 'Column 2', groupName: 'Group 1'}
                    ], {plugins: [columnGrouper]});

                    table.columnGrouper.formatters['Group 1'] = function(groupSpec){
                        return '<span>' + groupSpec.groupName + ' spans ' + groupSpec.count + ' columns</span>';
                    };

                    table.load([
                        {column1: 'column 1a', column2: 'column 2a'},
                        {column1: 'column 1b', column2: 'column 2b'}
                    ]);
                    table.render();

                    expect(table.$('thead').length).toEqual(1);
                    expect(table.$('thead tr').length).toEqual(2);
                    expect(table.$('thead tr:first').attr('class')).toEqual('columnGroups');
                    expect(table.$('thead tr:first th').length).toEqual(1);
                    expect(table.$('thead tr:first th').html().toLowerCase()).toEqual('<span>group 1 spans 2 columns</span>');
                });
            });
            describe('toggleColumns', function(){
                beforeEach(function(){
                    table = tabler.create([
                        {field: 'column1'},
                        {field: 'column2'}
                    ], {plugins: [toggleColumns]});

                    table.load([
                        {column1: 30, column2: 200},
                        {column1: 10, column2: 400},
                        {column1: 20, column2: 600}
                    ]);
                    table.render();
                });
                it('adds header row containing toggle button', function(){
                    expect(table.toggleColumns).toBeDefined();
                    expect(table.$('thead tr:first').hasClass('toggleColumns')).toEqual(true);
                    expect(table.$('thead tr:first th').length).toEqual(1);
                    expect(table.$('thead tr:first th').attr('colspan')).toEqual('2');
                    expect(table.$('thead tr:first button').text()).toEqual('Columns');
                });
                it('can specify headerHTML to go alongside button', function(){
                    table.toggleColumns.headerHTML = '<p>Hello there</p>';
                    table.render();

                    expect(table.$('thead tr.toggleColumns th p').text()).toEqual('Hello there');
                });
                it('can specify a function for the headerHTML', function(){
                    table.toggleColumns.headerHTML = function(){
                        return '<p>Hello there again</p>';
                    };
                    table.render();

                    expect(table.$('thead tr.toggleColumns th p').text()).toEqual('Hello there again');
                });
                it('calls headerHTML function on every render', function(){
                    var i = 0;
                    table.toggleColumns.headerHTML = function(){
                        return '<p>Hello there again ' + (++i) + '</p>';
                    };
                    table.render();
                    table.render();
                    table.render();

                    expect(table.$('thead tr.toggleColumns th p').text()).toEqual('Hello there again 3');
                });
                it('shows toggle UI on button click', function(){
                    table.$('tr.toggleColumns button').click();

                    expect($('.toggleColumnsUI').length).toEqual(1);
                    expect($('.toggleColumnsUI button.apply').length).toEqual(1);

                    expect($('.toggleColumnsUI').css('position')).toEqual('absolute');
                    expect($('.toggleColumnsUI').css('zIndex').toString()).toEqual('1000');
                });
                it('hides toggle UI on button click', function(){
                    table.$('tr.toggleColumns button').click();
                    table.$('tr.toggleColumns button').click();

                    expect($('.toggleColumnsUI').length).toEqual(0);
                });
                it('hides toggle UI on body click', function(){
                    table.$('tr.toggleColumns button').click();

                    $('body').click();

                    expect($('.toggleColumnsUI').length).toEqual(0);
                });
                it('hides toggle UI on window resize', function(){
                    table.$('tr.toggleColumns button').click();

                    $(window).resize();

                    expect($('.toggleColumnsUI').length).toEqual(0);
                });
                it('hides toggle UI when scrollParent scrolls', function(){
                    var $div = $('<div />').css({
                            overflow: 'scroll',
                            width: 100,
                            height: 100
                        }).appendTo('#testArea')
                        .html(table.$el);

                    table.$el.css({
                        height:1000,
                        width:1000
                    });

                    table.$('tr.toggleColumns button').click();

                    $div.scroll();

                    expect($('.toggleColumnsUI').length).toEqual(0);
                });
                it('does not hide toggle UI on click of showHide button', function(){
                    $('#testArea').html(table.$el);
                    table.$('button.showHide').click();

                    expect($('.toggleColumnsUI').length).toEqual(1);
                });
                it('does not hide toggle UI on click of toggleColumns UI', function(){
                    $('#testArea').html(table.$el);

                    table.$('button.showHide').click();
                    $('.toggleColumnsUI').click();

                    expect($('.toggleColumnsUI').length).toEqual(1);
                });
                it('does not hide toggle UI on click inside toggleColumns UI', function(){
                    $('#testArea').html(table.$el);

                    table.$('button.showHide').click();
                    $('.toggleColumnsUI > *').eq(0).click();

                    expect($('.toggleColumnsUI').length).toEqual(1);
                });

                it('has one li for each column in toggle UI', function(){
                    table.$('tr.toggleColumns button').click();

                    expect($('.toggleColumnsUI .columns li input[type=checkbox]').length).toEqual(2);
                    expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).val()).toEqual('column1');
                    expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).is(':checked')).toEqual(true);
                    expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).siblings('label').text()).toEqual('column1');
                    expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(1).val()).toEqual('column2');
                    expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(1).is(':checked')).toEqual(true);
                    expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(1).siblings('label').text()).toEqual('column2');
                });
                it('can have columns un-toggleable', function(){
                    table.spec[0].toggleable = false;

                    table.$('tr.toggleColumns button').click();

                    expect($('.toggleColumnsUI .columns li input[type=checkbox]').length).toEqual(1);
                    expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).val()).toEqual('column2');
                });
                it('shows disabled columns unchecked', function(){
                    table.spec[0].disabled = true;

                    table.$('tr.toggleColumns button').click();

                    expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).is(':checked')).toEqual(false);
                    expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(1).is(':checked')).toEqual(true);
                });
                it('can toggle off a column and the change is applied when "Apply" pressed', function(){
                    table.$('tr.toggleColumns button').click();

                    $('.toggleColumnsUI .columns li input[type=checkbox]').attr('checked', false);
                    $('.toggleColumnsUI button.apply').click();

                    expect(table.spec[0].disabled).toEqual(true);
                    expect(table.spec[1].disabled).toEqual(true);
                });
                it('can toggle columns back on again', function(){
                    table.spec[0].disabled = true;

                    table.$('tr.toggleColumns button').click();

                    $('.toggleColumnsUI .columns li input[type=checkbox]').prop('checked', true);
                    $('.toggleColumnsUI button.apply').click();

                    expect(table.spec[0].disabled).toEqual(false);
                    expect(table.spec[1].disabled).toEqual(false);
                });
                it('removes the toggleColumns UI and re-renders the table when "Apply" pressed', function(){
                    var renderSpy = sinon.spy(table, 'render');

                    table.$('tr.toggleColumns button').click();
                    $('.toggleColumnsUI button.apply').click();

                    expect($('.toggleColumnsUI').length).toEqual(0);
                    expect(renderSpy.calledOnce).toEqual(true);

                    renderSpy.restore();
                });
                it('triggers columnsToggled event when "Apply" pressed', function(){
                    var renderSpy = sinon.spy(table, 'render'),
                        columnsToggledSpy = sinon.spy();

                    table.bind('columnsToggled', columnsToggledSpy);

                    table.$('tr.toggleColumns button').click();
                    $('.toggleColumnsUI button.apply').click();

                    expect(columnsToggledSpy.calledOnce).toEqual(true);

                    renderSpy.restore();
                });
                it('disables the "Apply" button when no columns checked', function(){
                    var renderSpy = sinon.spy(table, 'render');

                    table.$('tr.toggleColumns button').click();

                    $('.toggleColumnsUI .columns li input[type=checkbox]')
                        .prop('checked', false)
                        .trigger('change');

                    expect($('.toggleColumnsUI').length).toEqual(1);
                    expect($('.toggleColumnsUI button').is(':disabled')).toEqual(true);

                    expect(table.spec[0].disabled).not.toEqual(true);
                    expect(table.spec[1].disabled).not.toEqual(true);
                    expect(renderSpy.called).toEqual(false);

                    renderSpy.restore();
                });
                it('removes the toggleColumns UI when "Cancel" pressed and does not apply changes to table', function(){
                    var renderSpy = sinon.spy(table, 'render');

                    table.spec[0].disabled = true;

                    table.$('tr.toggleColumns button').click();

                    $('.toggleColumnsUI .columns li input[type=checkbox]').prop('checked', true);
                    $('.toggleColumnsUI a.cancel').click();

                    expect($('.toggleColumnsUI').length).toEqual(0);

                    expect(table.spec[0].disabled).toEqual(true);
                    expect(renderSpy.called).toEqual(false);

                    renderSpy.restore();
                });
                it('can toggle columns without a field name', function(){
                    var renderSpy = sinon.spy(table, 'render');

                    table.addToSpec({name: 'No field', disabled: true});

                    table.$('tr.toggleColumns button').click();

                    $('.toggleColumnsUI .columns li input[type=checkbox]')
                        .prop('checked', true);

                    $('.toggleColumnsUI button.apply').click();

                    expect(table.spec[0].disabled).not.toEqual(true);
                    expect(table.spec[1].disabled).not.toEqual(true);
                    expect(table.spec[2].disabled).not.toEqual(true);
                    expect(renderSpy.calledOnce).toEqual(true);

                    renderSpy.restore();
                });

                describe('column groups', function(){
                    beforeEach(function(){
                        table.spec[0].groupName = 'Group 1';
                        table.spec[1].groupName = 'Group 1';

                        table.render();
                    });
                    it('shows toggle UI divided up by column group', function(){
                        table.$('tr.toggleColumns button').click();

                        expect($('.toggleColumnsUI ul.columns li').length).toEqual(3);
                        expect($('.toggleColumnsUI ul.columns > li').length).toEqual(1);
                        expect($('.toggleColumnsUI ul.columns > li input').val()).toEqual('');
                        expect($('.toggleColumnsUI ul.columns > li input').is(':checked')).toEqual(true);
                        expect($('.toggleColumnsUI ul.columns > li li').length).toEqual(2);
                        expect($('.toggleColumnsUI ul.columns > li li input').eq(0).val()).toEqual('column1');
                        expect($('.toggleColumnsUI ul.columns > li li input').eq(0).is(':checked')).toEqual(true);
                        expect($('.toggleColumnsUI ul.columns > li li input').eq(1).val()).toEqual('column2');
                        expect($('.toggleColumnsUI ul.columns > li li input').eq(1).is(':checked')).toEqual(true);
                    });
                    it('shows column group input checked but partially selected when only some columns checked', function(){
                        table.spec[0].disabled = true;

                        table.$('tr.toggleColumns button').click();

                        expect($('.toggleColumnsUI ul.columns > li input').is(':checked')).toEqual(true);
                        expect($('.toggleColumnsUI ul.columns > li input').hasClass('partiallySelected')).toEqual(true);
                        expect($('.toggleColumnsUI ul.columns > li li input').eq(0).is(':checked')).toEqual(false);
                        expect($('.toggleColumnsUI ul.columns > li li input').eq(1).is(':checked')).toEqual(true);
                    });
                    it('changes column group input to partially selected when some columns unchecked', function(){
                        table.$('tr.toggleColumns button').click();

                        $('.toggleColumnsUI ul.columns > li li input:first').attr('checked', false).change();

                        expect($('.toggleColumnsUI ul.columns > li input').is(':checked')).toEqual(true);
                        expect($('.toggleColumnsUI ul.columns > li input').hasClass('partiallySelected')).toEqual(true);
                    });
                    it('resets partiallySelected class when column group unchecked', function(){
                        table.spec[0].disabled = true;

                        table.$('tr.toggleColumns button').click();

                        $('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]').attr('checked', false).change();

                        expect($('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]')
                            .hasClass('partiallySelected')).toEqual(false);
                    });
                    it('resets partiallySelected class when column group checked', function(){
                        table.spec[0].disabled = true;

                        table.$('tr.toggleColumns button').click();

                        $('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]').attr('checked', true).change();

                        expect($('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]')
                            .hasClass('partiallySelected')).toEqual(false);
                    });
                    it('unchecks column group input when all columns unchecked', function(){
                        table.$('tr.toggleColumns button').click();

                        $('.toggleColumnsUI ul.columns > li li input').attr('checked', false).change();

                        expect($('.toggleColumnsUI ul.columns > li input').is(':checked')).toEqual(false);
                        expect($('.toggleColumnsUI ul.columns > li input').hasClass('partiallySelected')).toEqual(false);
                    });
                    it('unchecks all columns when column group unchecked', function(){
                        table.$('tr.toggleColumns button').click();

                        $('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]').attr('checked', false).change();

                        expect($('.toggleColumnsUI ul.columns > li:first input[name=column]').is(':checked')).toEqual(false);
                    });
                    it('checks all columns when partially selected and clicked', function(){
                        table.spec[0].disabled = true;

                        table.$('tr.toggleColumns button').click();

                        $('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]').attr('checked', false).change();

                        expect($('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]').prop('checked')).toEqual(true);
                        expect($('.toggleColumnsUI ul.columns > li input').is(':checked')).toEqual(true);
                        expect($('.toggleColumnsUI ul.columns > li input').hasClass('partiallySelected')).toEqual(false);
                    });
                    it('still applies changes to the table when apply clicked', function(){
                        table.spec[0].disabled = true;

                        table.$('tr.toggleColumns button').click();

                        $('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]').attr('checked', true).change();
                        $('.toggleColumnsUI button.apply').click();

                        expect($('.toggleColumnsUI').length).toEqual(0);
                        expect(table.spec[0].disabled).toEqual(false);
                        expect(table.spec[1].disabled).toEqual(false);
                    });

                    describe('open/close column groups', function(){
                        var $toggleUI;
                        beforeEach(function(){
                            table.$('tr.toggleColumns button').click();

                            $toggleUI = $('.toggleColumnsUI');
                        });
                        it('shows column group open/close links', function(){
                            expect($toggleUI.find('li.columnGroup a.opener').length).toEqual(1);
                            expect($toggleUI.find('li.columnGroup a.opener').text()).toEqual('+');
                        });
                        it('has all column groups closed by default', function(){
                            expect($toggleUI.find('li.columnGroup').hasClass('closed')).toEqual(true);
                        });
                        it('opens groups on click of link', function(){
                            $toggleUI.find('li.columnGroup a.opener').click();

                            expect($toggleUI.find('li.columnGroup').hasClass('closed')).toEqual(false);
                            expect($toggleUI.find('li.columnGroup').hasClass('open')).toEqual(true);
                            expect($toggleUI.find('li.columnGroup a.opener').text()).toEqual('–');
                        });
                        it('closes groups on second click of link', function(){
                            $toggleUI.find('li.columnGroup a.opener').click();
                            $toggleUI.find('li.columnGroup a.opener').click();

                            expect($toggleUI.find('li.columnGroup').hasClass('closed')).toEqual(true);
                            expect($toggleUI.find('li.columnGroup').hasClass('open')).toEqual(false);
                            expect($toggleUI.find('li.columnGroup a.opener').text()).toEqual('+');
                        });
                    });
                });

                describe('custom column defs', function(){
                    it('can add custom column definitions which aren\'t in main column definition and show up', function(){
                        table.toggleColumns.customColumns.push({id: 'custom', name: 'Custom field'});

                        table.$('tr.toggleColumns button').click();

                        expect($('.toggleColumnsUI .columns li input[type=checkbox]').length).toEqual(3);
                        expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).val()).toEqual('custom');
                        expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).next().text()).toEqual('Custom field');
                        expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(1).val()).toEqual('column1');
                        expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(2).val()).toEqual('column2');
                    });
                    it('sets that field as disabled: true when unchecked', function(){
                        table.toggleColumns.customColumns.push({id: 'custom', name: 'Custom field'});

                        table.$('tr.toggleColumns button').click();

                        $('.toggleColumnsUI .columns li input[type=checkbox]').prop('checked', false);

                        $('.toggleColumnsUI button.apply').click();

                        expect(table.toggleColumns.getCustomColumn({id: 'custom'}).disabled).toEqual(true);
                    });
                });
            });
            describe('sortable', function(){
                it('adds client-side sorting to columns with sortable: true', function(){
                    table = tabler.create([
                        {field: 'column1', sortable: true},
                        {field: 'column2', sortable: false}
                    ], {plugins: [sortable]});

                    table.load([
                        {column1: 30, column2: 200},
                        {column1: 10, column2: 400},
                        {column1: 20, column2: 600}
                    ]);
                    table.render();

                    expect(table.$('tr').length).toEqual(4);
                    expect(table.$('thead').length).toEqual(1);
                    expect(table.$('thead th').hasClass('sortable')).toEqual(true);
                    expect(table.$('thead th').eq(0).find('a.sort').length).toEqual(1);
                    expect(table.$('thead th').eq(0).find('a.sort').data('sort-key')).toEqual('column1');
                    expect(table.$('thead th').eq(1).find('a.sort').length).toEqual(0);
                });
                it('preserves className on ths', function(){
                    table = tabler.create([
                        {field: 'column1', sortable: true, className: 'myClass'}
                    ], {plugins: [sortable]});

                    table.load([
                        {column1: 30, column2: 200},
                        {column1: 10, column2: 400},
                        {column1: 20, column2: 600}
                    ]);
                    table.render();

                    expect(table.$('tr').length).toEqual(4);
                    expect(table.$('thead').length).toEqual(1);
                    expect(table.$('thead th').hasClass('sortable')).toEqual(true);
                    expect(table.$('thead th').hasClass('myClass')).toEqual(true);
                });
                it('preserves headerClassName on ths', function(){
                    table = tabler.create([
                        {field: 'column1', sortable: true, headerClassName: 'myClass'}
                    ], {plugins: [sortable]});

                    table.load([
                        {column1: 30, column2: 200},
                        {column1: 10, column2: 400},
                        {column1: 20, column2: 600}
                    ]);
                    table.render();

                    expect(table.$('tr').length).toEqual(4);
                    expect(table.$('thead').length).toEqual(1);
                    expect(table.$('thead th').hasClass('sortable')).toEqual(true);
                    expect(table.$('thead th').hasClass('myClass')).toEqual(true);
                });
                it('can client-side sorts descending on first header click', function(){
                    table = tabler.create([
                        {field: 'column1', sortable: true},
                        {field: 'column2', sortable: false}
                    ], {plugins: [sortable]});

                    table.load([
                        {column1: 30, column2: 200},
                        {column1: 10, column2: 400},
                        {column1: 20, column2: 600}
                    ]);
                    table.render();

                    table.$('thead th:first a.sort').click();

                    expect(table.$('thead th:first').attr('class')).toEqual('sortable sorted-desc');
                    expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('30');
                    expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('20');
                    expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('10');
                });
                it('can client-side sorts ascending on second header click', function(){
                    table = tabler.create([
                        {field: 'column1', sortable: true},
                        {field: 'column2', sortable: false}
                    ], {plugins: [sortable]});

                    table.load([
                        {column1: 30, column2: 200},
                        {column1: 10, column2: 400},
                        {column1: 20, column2: 600}
                    ]);
                    table.render();

                    table.$('thead th:first a.sort').click();
                    table.$('thead th:first a.sort').click();

                    expect(table.$('thead th:first').attr('class')).toEqual('sortable sorted-asc');
                    expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('10');
                    expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('20');
                    expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('30');
                });
                it('sorts on TH click', function(){
                    table = tabler.create([
                        {field: 'column1', sortable: true},
                        {field: 'column2', sortable: false}
                    ], {plugins: [sortable]});

                    table.load([
                        {column1: 30, column2: 200},
                        {column1: 10, column2: 400},
                        {column1: 20, column2: 600}
                    ]);
                    table.render();

                    table.$('thead th:first').click();
                    table.$('thead th:first').click();

                    expect(table.$('thead th:first').attr('class')).toEqual('sortable sorted-asc');
                    expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('10');
                    expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('20');
                    expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('30');
                });
                it('does not sort unsortable columns on TH click', function(){
                    table = tabler.create([
                        {field: 'column1', sortable: true},
                        {field: 'column2', sortable: false}
                    ], {plugins: [sortable]});

                    table.load([
                        {column1: 30, column2: 500},
                        {column1: 10, column2: 400},
                        {column1: 20, column2: 600}
                    ]);
                    table.render();

                    table.$('thead th:eq(1)').click();

                    expect(table.$('thead th:eq(1)').hasClass('sorted-desc')).toEqual(false);
                    expect(table.$('tbody tr').eq(0).find('td').eq(1).text()).toEqual('500');
                    expect(table.$('tbody tr').eq(1).find('td').eq(1).text()).toEqual('400');
                    expect(table.$('tbody tr').eq(2).find('td').eq(1).text()).toEqual('600');
                });
                it('can pre-sort table', function(){
                    table = tabler.create([
                        {field: 'column1', sortable: true},
                        {field: 'column2', sortable: false}
                    ], {plugins: [sortable]});

                    table.sortable.field = 'column1';
                    table.sortable.direction = 'desc';

                    table.load([
                        {column1: 30, column2: 200},
                        {column1: 10, column2: 400},
                        {column1: 20, column2: 600}
                    ]);
                    table.render();

                    expect(table.$('thead th:first').attr('class')).toEqual('sortable sorted-desc');
                    expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('30');
                    expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('20');
                    expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('10');
                });
                it('updates sort headers correctly when sorting removed externally', function(){
                    table = tabler.create([
                        {field: 'column1', sortable: true},
                        {field: 'column2', sortable: true}
                    ], {plugins: [sortable]});

                    table.sortable.field = 'column1';
                    table.sortable.direction = 'desc';

                    table.load([
                        {column1: 30, column2: 200},
                        {column1: 10, column2: 400},
                        {column1: 20, column2: 600}
                    ]);
                    table.render();

                    delete table.sortable.field;
                    delete table.sortable.direction;
                    table.render();

                    expect(table.$('thead th').eq(0).attr('class')).toEqual('sortable');
                    expect(table.$('thead th').eq(1).attr('class')).toEqual('sortable');
                    expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('30');
                    expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('10');
                    expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('20');
                });
                it('does not add sorted classes to columns without a field name', function(){
                    table = tabler.create([
                        {name: 'column1'}
                    ], {plugins: [sortable]});

                    table.load([
                        {column1: 30},
                        {column1: 10},
                        {column1: 20}
                    ]);
                    table.render();

                    expect(table.$('thead th').eq(0).attr('class') || '').toEqual('');
                });
                it('cleans up invalid sort direction', function(){
                    table = tabler.create([
                        {field: 'column1', sortable: true},
                        {field: 'column2', sortable: false}
                    ], {plugins: [sortable]});

                    table.sortable.field = 'column1';
                    table.sortable.direction = 'descending';

                    table.load([
                        {column1: 30, column2: 200},
                        {column1: 10, column2: 400},
                        {column1: 20, column2: 600}
                    ]);
                    table.render();

                    expect(table.$('thead th:first').attr('class')).toEqual('sortable sorted-desc');
                    expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('10');
                    expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('20');
                    expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('30');
                });
                it('calls fetch override with sort parameters', function(){
                    var fetchSpy = sinon.spy(function(options, callback){
                            callback({items: data});
                        }),
                        data;

                    table = tabler.create([
                        {field: 'column1', sortable: true},
                        {field: 'column2', sortable: false}
                    ], {plugins: [sortable], fetch: fetchSpy}),

                    table.load(data = [
                        {column1: 30, column2: 200},
                        {column1: 10, column2: 400},
                        {column1: 20, column2: 600}
                    ]);
                    table.render();

                    table.$('thead th:first a.sort').click();
                    table.$('thead th:first a.sort').click();

                    expect(fetchSpy.calledThrice).toEqual(true);
                    expect(fetchSpy.args[0][0].field).not.toBeDefined();
                    expect(fetchSpy.args[0][0].direction).not.toBeDefined();
                    expect(fetchSpy.args[1][0].field).toEqual('column1');
                    expect(fetchSpy.args[1][0].direction).toEqual('desc');
                    expect(fetchSpy.args[2][0].field).toEqual('column1');
                    expect(fetchSpy.args[2][0].direction).toEqual('asc');
                });
                it('adds sortable classes to fields added after the table is initialised', function(){
                    table = tabler.create([{field: 'column1', sortable: true}], {plugins: [sortable]});

                    table.addToSpec({field: 'column2', sortable: true});

                    expect(table.spec[1].className.trim()).toEqual('sortable');
                });
            });
            describe('pager', function(){
                beforeEach(function(){
                    table = tabler.create([
                        {field: 'column1'},
                        {field: 'column2'}
                    ], {plugins: [pager]});

                    table.load([
                        {column1: '1a', column2: '2a'},
                        {column1: '1b', column2: '2b'},
                        {column1: '1c', column2: '2c'},
                        {column1: '1d', column2: '2d'},
                        {column1: '1e', column2: '2e'}
                    ]);
                });

                it('adds pager ul to the tfoot of the table', function(){
                    table.render();

                    expect(table.$('tfoot').length).toEqual(1);
                    expect(table.$('tfoot tr td').length).toEqual(1);
                    expect(table.$('tfoot tr td').attr('colspan')).toEqual('2');
                    expect(table.$('tfoot tr td ol.pager').length).toEqual(1);
                });
                it('only renders pageSize worth of data', function(){
                    table.pager.pageSize = 2;
                    table.render();

                    expect(table.$('tbody tr').length).toEqual(2);
                });
                it('shows current page li with a class of current', function(){
                    table.pager.pageSize = 2;
                    table.render();

                    expect(table.$('tfoot tr td ol.pager li').length).toEqual(4);
                    expect(table.$('tfoot tr td ol.pager li').eq(0).hasClass('current')).toEqual(true);
                    expect(table.$('tfoot tr td ol.pager li').eq(0).data('page')).toEqual(0);
                    expect(table.$('tfoot tr td ol.pager li').eq(0).text()).toEqual('1');
                    expect(table.$('tfoot tr td ol.pager li').eq(1).hasClass('current')).toEqual(false);
                    expect(table.$('tfoot tr td ol.pager li').eq(1).data('page')).toEqual(1);
                    expect(table.$('tfoot tr td ol.pager li').eq(1).text()).toEqual('2');
                    expect(table.$('tfoot tr td ol.pager li').eq(2).hasClass('current')).toEqual(false);
                    expect(table.$('tfoot tr td ol.pager li').eq(2).text()).toEqual('3');
                    expect(table.$('tfoot tr td ol.pager li').eq(2).data('page')).toEqual(2);
                    expect(table.$('tfoot tr td ol.pager li').eq(3).text()).toEqual('Next');
                    expect(table.$('tfoot tr td ol.pager li').eq(3).data('page')).toEqual(1);
                    expect(table.$('tfoot tr td ol.pager li').eq(3).hasClass('next')).toEqual(true);
                });
                it('can page through results by clicking on page links', function(){
                    table.pager.pageSize = 2;
                    table.render();

                    table.$('tfoot tr td ol.pager li[data-page=1]').click();

                    expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('1c');
                    expect(table.$('tbody tr').eq(0).find('td').eq(1).text()).toEqual('2c');
                    expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('1d');
                    expect(table.$('tbody tr').eq(1).find('td').eq(1).text()).toEqual('2d');

                    table.$('tfoot tr td ol.pager li[data-page=2]').click();

                    expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('1e');
                    expect(table.$('tbody tr').eq(0).find('td').eq(1).text()).toEqual('2e');
                });
                it('triggers "paged" events on clicking page links', function(){
                    var pagedSpy = sinon.spy();

                    table.bind('paged', pagedSpy);
                    table.pager.pageSize = 2;
                    table.render();

                    table.$('tfoot tr td ol.pager li[data-page=1]').click();

                    expect(pagedSpy.calledOnce).toEqual(true);
                    expect(pagedSpy.args[0][0]).toEqual({
                        currentPage: 1,
                        pageSize: 2
                    });
                });
                it('renders Previous link when on page > 1', function(){
                    table.pager.pageSize = 2;

                    table.render();

                    table.$('tfoot tr td ol.pager li[data-page=1]').click();

                    expect(table.$('tfoot tr td ol.pager li:first').text()).toEqual('Previous');
                    expect(table.$('tfoot tr td ol.pager li:first').data('page')).toEqual(0);
                    expect(table.$('tfoot tr td ol.pager li:first').hasClass('prev')).toEqual(true);
                });
                it('Does not render Next link when on last page', function(){
                    table.pager.pageSize = 2;

                    table.render();

                    table.$('tfoot tr td ol.pager li[data-page=2]').click();

                    expect(table.$('tfoot tr td ol.pager li:last').text()).toEqual('3');
                    expect(table.$('tfoot tr td ol.pager li:last').data('page')).toEqual(2);
                });
                describe('links when lots of pages', function(){
                    var testData = (function generateData(i, data){
                        if(i-- === 0){
                            return data;
                        }
                        data.push({
                            column1: '1' + String.fromCharCode(i), column2: '2' + String.fromCharCode(i)
                        });
                        return generateData(i, data);
                    })(250, []);
                    beforeEach(function(){
                        table.pager.pageSize = 20;
                        table.load(testData);
                    });
                    describe('on first page', function(){
                        beforeEach(function(){
                            table.render();
                        });
                        it('renders the current page li', function(){
                            expect(table.$('tfoot ol.pager li.current').length).toEqual(1);
                            expect(table.$('tfoot ol.pager li.current').text()).toEqual('1');
                            expect(table.$('tfoot ol.pager li.current').data('page')).toEqual(0);
                        });
                        it('renders the next 5 page links', function(){
                            expect(table.$('tfoot ol.pager li:not(.current,.next,.last)').length).toEqual(5);
                            expect(table.$('tfoot ol.pager li:not(.current,.next,.last)').eq(0).data('page')).toEqual(1);
                            expect(table.$('tfoot ol.pager li:not(.current,.next,.last)').eq(1).data('page')).toEqual(2);
                            expect(table.$('tfoot ol.pager li:not(.current,.next,.last)').eq(2).data('page')).toEqual(3);
                            expect(table.$('tfoot ol.pager li:not(.current,.next,.last)').eq(3).data('page')).toEqual(4);
                            expect(table.$('tfoot ol.pager li:not(.current,.next,.last)').eq(4).data('page')).toEqual(5);
                        });
                        it('renders the last page link', function(){
                            expect(table.$('tfoot ol.pager li:not(.next):last').text()).toEqual('13');
                            expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                            expect(table.$('tfoot ol.pager li:not(.next):last').data('page')).toEqual(12);
                        });
                    });
                    describe('on mid-point page', function(){
                        beforeEach(function(){
                            table.pager.currentPage = 5;
                            table.render();
                        });
                        it('renders the current page li', function(){
                            expect(table.$('tfoot ol.pager li.current').text()).toEqual('6');
                            expect(table.$('tfoot ol.pager li.current').data('page')).toEqual(5);
                        });
                        it('renders the first page link with "skipped" class', function(){
                            expect(table.$('tfoot ol.pager li:not(.prev):first').text()).toEqual('1');
                            expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('first')).toEqual(true);
                            expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('skipped')).toEqual(true);
                            expect(table.$('tfoot ol.pager li:not(.prev):first').data('page')).toEqual(0);
                        });
                        it('renders the previous 2 page links before current', function(){
                            var previousLinks = table.$('tfoot ol.pager li.current').prevAll('li:not(.first,.prev)');

                            expect(previousLinks.length).toEqual(2);
                            expect(previousLinks.eq(0).text()).toEqual('4');
                            expect(previousLinks.eq(0).data('page')).toEqual(3);
                            expect(previousLinks.eq(1).text()).toEqual('5');
                            expect(previousLinks.eq(1).data('page')).toEqual(4);
                        });
                        it('renders the next 3 page links after current', function(){
                            var previousLinks = table.$('tfoot ol.pager li.current').nextAll('li:not(.last,.next)');

                            expect(previousLinks.length).toEqual(3);
                            expect(previousLinks.eq(0).text()).toEqual('7');
                            expect(previousLinks.eq(0).data('page')).toEqual(6);
                            expect(previousLinks.eq(1).text()).toEqual('8');
                            expect(previousLinks.eq(1).data('page')).toEqual(7);
                            expect(previousLinks.eq(2).text()).toEqual('9');
                            expect(previousLinks.eq(2).data('page')).toEqual(8);
                        });
                        it('renders the last page link with "skipped" class', function(){
                            expect(table.$('tfoot ol.pager li:not(.next):last').text()).toEqual('13');
                            expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                            expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('skipped')).toEqual(true);
                            expect(table.$('tfoot ol.pager li:not(.next):last').data('page')).toEqual(12);
                        });
                    });
                    describe('on last page', function(){
                        beforeEach(function(){
                            table.pager.currentPage = 12;
                            table.render();
                        });
                        it('renders the current page li', function(){
                            expect(table.$('tfoot ol.pager li.current').text()).toEqual('13');
                            expect(table.$('tfoot ol.pager li.current').data('page')).toEqual(12);
                        });
                        it('renders the first page link', function(){
                            expect(table.$('tfoot ol.pager li:not(.prev):first').text()).toEqual('1');
                            expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('first')).toEqual(true);
                            expect(table.$('tfoot ol.pager li:not(.prev):first').data('page')).toEqual(0);
                        });
                        it('renders the last 5 page links', function(){
                            expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').length).toEqual(5);
                            expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(0).data('page')).toEqual(7);
                            expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(0).text()).toEqual('8');
                            expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(1).data('page')).toEqual(8);
                            expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(1).text()).toEqual('9');
                            expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(2).data('page')).toEqual(9);
                            expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(2).text()).toEqual('10');
                            expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(3).data('page')).toEqual(10);
                            expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(3).text()).toEqual('11');
                            expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(4).data('page')).toEqual(11);
                            expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(4).text()).toEqual('12');
                        });
                        it('renders last link', function(){
                            expect(table.$('tfoot ol.pager li.last').length).toEqual(1);
                        });
                    });
                    describe('edge-cases', function(){
                        describe('on 4th page out of 4', function(){
                            beforeEach(function(){
                                table.pager.totalResults = 80;
                                table.pager.currentPage = 3;
                                table.render();
                            });
                            it('renders the first 3 pages correctly', function(){
                                var prevLinks = table.$('tfoot ol.pager li.current').prevAll(':not(.prev)');

                                expect(prevLinks.length).toEqual(3);
                                expect(prevLinks.eq(0).data('page')).toEqual(2);
                                expect(prevLinks.eq(1).data('page')).toEqual(1);
                                expect(prevLinks.eq(2).data('page')).toEqual(0);
                                expect(prevLinks.eq(2).hasClass('first')).toEqual(true);
                            });
                        });
                        describe('on 4th to last page', function(){
                            beforeEach(function(){
                                table.pager.currentPage = 9;
                                table.render();
                            });
                            it('renders the next 4 pages correctly', function(){
                                var nextLinks = table.$('tfoot ol.pager li.current').nextAll(':not(.next)');

                                expect(nextLinks.length).toEqual(3);
                                expect(nextLinks.eq(0).data('page')).toEqual(10);
                                expect(nextLinks.eq(1).data('page')).toEqual(11);
                                expect(nextLinks.eq(2).data('page')).toEqual(12);
                                expect(nextLinks.eq(2).hasClass('last')).toEqual(true);
                            });
                        });
                        describe('on second page', function(){
                            beforeEach(function(){
                                table.pager.currentPage = 1;
                                table.render();
                            });
                            it('does not give "skipped" class to first element', function(){
                                expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('first')).toEqual(true);
                                expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('skipped')).toEqual(false);
                            });
                        });
                        describe('on third page', function(){
                            beforeEach(function(){
                                table.pager.currentPage = 2;
                                table.render();
                            });
                            it('does not give "skipped" class to first element', function(){
                                expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('first')).toEqual(true);
                                expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('skipped')).toEqual(false);
                            });
                        });
                        describe('on fourth page', function(){
                            beforeEach(function(){
                                table.pager.currentPage = 3;
                                table.render();
                            });
                            it('does not give "skipped" class to first element', function(){
                                expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('first')).toEqual(true);
                                expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('skipped')).toEqual(false);
                            });
                        });
                        describe('on fifth page', function(){
                            beforeEach(function(){
                                table.pager.currentPage = 4;
                                table.render();
                            });
                            it('gives "skipped" class to first element', function(){
                                expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('first')).toEqual(true);
                                expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('skipped')).toEqual(true);
                            });
                        });
                        describe('on last but one page', function(){
                            beforeEach(function(){
                                table.pager.currentPage = 12;
                                table.render();
                            });
                            it('does not give "skipped" class to last element', function(){
                                expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                                expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('skipped')).toEqual(false);
                            });
                        });
                        describe('on last but two page', function(){
                            beforeEach(function(){
                                table.pager.currentPage = 11;
                                table.render();
                            });
                            it('does not give "skipped" class to last element', function(){
                                expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                                expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('skipped')).toEqual(false);
                            });
                        });
                        describe('on last but three page', function(){
                            beforeEach(function(){
                                table.pager.currentPage = 10;
                                table.render();
                            });
                            it('does not give "skipped" class to last element', function(){
                                expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                                expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('skipped')).toEqual(false);
                            });
                        });
                        describe('on last but four page', function(){
                            beforeEach(function(){
                                table.pager.currentPage = 9;
                                table.render();
                            });
                            it('does not give "skipped" class to last element', function(){
                                expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                                expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('skipped')).toEqual(false);
                            });
                        });
                        describe('on last but five page', function(){
                            beforeEach(function(){
                                table.pager.currentPage = 8;
                                table.render();
                            });
                            it('does not give "skipped" class to last element', function(){
                                expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                                expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('skipped')).toEqual(true);
                            });
                        });
                    });
                });
                describe('works with server-side paging', function(){
                    var fetchSpy;
                    beforeEach(function(){
                        table.pager.pageSize = 2;

                        table.fetch = fetchSpy = sinon.spy(function(options, done){
                            done({items: [], totalResults: 5});
                        });

                        table.render();
                    });
                    it('calls fetch override with correct paging options', function(){
                        expect(table.$('tfoot ol.pager li.next').length).toEqual(1);

                        table.$('tfoot ol.pager li.next').click();

                        expect(fetchSpy.calledTwice).toEqual(true);
                        expect(fetchSpy.args[0][0].currentPage).toEqual(0);
                        expect(fetchSpy.args[0][0].pageSize).toEqual(2);
                        expect(fetchSpy.args[1][0].currentPage).toEqual(1);
                        expect(fetchSpy.args[1][0].pageSize).toEqual(2);
                    });
                });
                describe('standalone', function(){
                    it('can be rendered without a tabler instance', function(){
                        var Pager = pager,
                            p = new Pager(),
                            $pager;

                        p.attach({
                            $el: $('<div />')
                        });

                        p.currentPage = 3;
                        p.totalResults = 300;

                        $pager = $(p.render());

                        expect($pager.is('ol')).toEqual(true);
                        expect($pager.hasClass('pager')).toEqual(true);
                        expect($pager.find('li').length).toEqual(10);
                        expect($pager.find('li').eq(4).hasClass('current')).toEqual(true);
                    });
                    it('can be used without a tabler instance', function(){
                        var Pager = pager,
                            fetchSpy = sinon.spy(function(options, callback){
                                callback({items: []});
                            }),
                            p = new Pager(),
                            $el = $('<div />');

                        p.attach({
                            $el: $el,
                            fetch: fetchSpy
                        });

                        p.totalResults = 300;

                        $el.append(p.render());

                        $el.find('li:eq(3)').click();

                        expect(p.currentPage).toEqual(3);
                        expect(fetchSpy.calledOnce).toEqual(true);
                        expect(fetchSpy.args[0][0].currentPage).toEqual(3);
                        expect(fetchSpy.args[0][0].pageSize).toEqual(20);
                    });
                });
            });
            describe('pageSize', function(){
                beforeEach(function(){
                    table = tabler.create([
                        {field: 'column1'}
                    ], {plugins: [pager, pageSize]});

                    table.pager.pageSize =  2;
                    table.load([
                        {column1: '1a', column2: '2a'},
                        {column1: '1b', column2: '2b'},
                        {column1: '1c', column2: '2c'},
                        {column1: '1d', column2: '2d'},
                        {column1: '1e', column2: '2e'}
                    ]);
                });
                it('throws error when pager plugin not loaded', function(){
                    try{
                        table = tabler.create([], [pageSize]);
                    }catch(e){
                        expect(e.message).toEqual('pageSize plugin cannot be used without the pager plugin');
                    }
                });
                it('can add a pageSize plugin with default page sizes', function(){
                    table.render();

                    expect(table.$('tfoot td p.pageSize').length).toEqual(1);
                    expect(table.$('tfoot td p.pageSize select option').length).toEqual(3);
                    expect(table.$('tfoot td p.pageSize select option').eq(0).val()).toEqual('20');
                    expect(table.$('tfoot td p.pageSize select option').eq(1).val()).toEqual('50');
                    expect(table.$('tfoot td p.pageSize select option').eq(2).val()).toEqual('100');
                });
                it('renders with correct page size value selected', function(){
                    table.pager.pageSize = 100;

                    table.render();

                    expect(table.$('tfoot td p.pageSize select').val()).toEqual('100');
                });
                it('renders with a label and span around the select', function(){
                    table.render();

                    expect(table.$('tfoot td p.pageSize select').prev().is('label')).toEqual(true);
                    expect(table.$('tfoot td p.pageSize select').prev().text()).toEqual('Show');
                    expect(table.$('tfoot td p.pageSize select').next().is('span')).toEqual(true);
                    expect(table.$('tfoot td p.pageSize select').next().text()).toEqual('items / page');
                });
                it('can set custom before text', function(){
                    table.pageSize.beforeText = 'Page Size';
                    table.pageSize.afterText = 'somethings / page';

                    table.render();

                    expect(table.$('tfoot td p.pageSize select').prev().text()).toEqual('Page Size');
                    expect(table.$('tfoot td p.pageSize select').next().text()).toEqual('somethings / page');
                });
                it('can add a pageSize plugin with custom page sizes', function(){
                    table.pageSize.sizes = [10, 20];

                    table.render();

                    expect(table.$('tfoot td p.pageSize').length).toEqual(1);
                    expect(table.$('tfoot td p.pageSize select option').length).toEqual(2);
                    expect(table.$('tfoot td p.pageSize select option').eq(0).val()).toEqual('10');
                    expect(table.$('tfoot td p.pageSize select option').eq(1).val()).toEqual('20');
                });
                it('re-renders the table with the correct number of results on page size update', function(){
                    table.pager.currentPage = 2;
                    table.render();

                    table.$('tfoot p.pageSize select').val(50).change();

                    expect(table.pager.pageSize).toEqual(50);
                    expect(table.pager.currentPage).toEqual(0);
                    expect(table.$('tbody tr').length).toEqual(5);
                });
                describe('standalone', function(){
                    it('can be used without a tabler instance', function(){
                        var PageSize = pageSize,
                            Pager = pager,
                            p = new Pager(),
                            ps = new PageSize(),
                            $pageSize;

                        ps.attach({
                            $el: $('<div />'),
                            pager: p
                        });

                        p.currentPage = 3;
                        p.totalResults = 10;

                        $pageSize = $(ps.render());

                        expect($pageSize.is('p')).toEqual(true);
                        expect($pageSize.hasClass('pageSize')).toEqual(true);
                        expect($pageSize.find('select option').length).toEqual(3);
                    });
                });
            });
            describe('jumpToPage', function(){
                beforeEach(function(){
                    table = tabler.create([
                        {field: 'column1'}
                    ], {plugins: [pager, jumpToPage]});

                    table.pager.pageSize =  2;
                    table.load([
                        {column1: '1a', column2: '2a'},
                        {column1: '1b', column2: '2b'},
                        {column1: '1c', column2: '2c'},
                        {column1: '1d', column2: '2d'},
                        {column1: '1e', column2: '2e'}
                    ]);
                });
                it('throws error when pager plugin not loaded', function(){
                    try{
                        table = tabler.create([], [jumpToPage]);
                    }catch(e){
                        expect(e.message).toEqual('jumpToPage plugin cannot be used without the pager plugin');
                    }
                });
                it('renders itself after the pager', function(){
                    table.render();

                    expect(table.$('ol.pager').next().is('p.jumpToPage')).toEqual(true);
                });
                it('renders as a label, input and button', function(){
                    table.render();

                    expect(table.$('p.jumpToPage').children().length).toEqual(3);
                    expect(table.$('p.jumpToPage').children().eq(0).is('label')).toEqual(true);
                    expect(table.$('p.jumpToPage').children().eq(1).is('input[type=text]')).toEqual(true);
                    expect(table.$('p.jumpToPage').children().eq(2).is('button')).toEqual(true);
                });
                it('changes the page index & re-renders the table when "Go" button clicked', function(){
                    var renderStub;
                    table.render();

                    renderStub = sinon.stub(table, 'render');

                    table.$('p.jumpToPage input').val('2');
                    table.$('p.jumpToPage button').click();

                    expect(table.pager.currentPage).toEqual(1);
                    expect(renderStub.calledOnce).toEqual(true);

                    renderStub.restore();
                });
                it('changes the page index & re-renders the table when Enter key pressed in input', function(){
                    var renderStub,
                        enterKey = jQuery.Event('keydown', {which: 13});

                    table.render();

                    renderStub = sinon.stub(table, 'render');

                    table.$('p.jumpToPage input').val('2');
                    table.$('p.jumpToPage input').trigger(enterKey);

                    expect(enterKey.isDefaultPrevented()).toEqual(true);
                    expect(table.pager.currentPage).toEqual(1);
                    expect(renderStub.calledOnce).toEqual(true);

                    renderStub.restore();
                });
                it('does not react to other key presses', function(){
                    var renderStub;

                    table.render();

                    renderStub = sinon.stub(table, 'render');

                    table.$('p.jumpToPage input').keydown();

                    expect(renderStub.called).toEqual(false);

                    renderStub.restore();
                });
                it('ignores submission attempts when no value input', function(){
                    var renderStub;

                    table.render();

                    renderStub = sinon.stub(table, 'render');

                    table.$('p.jumpToPage button').click();

                    expect(renderStub.called).toEqual(false);

                    renderStub.restore();
                });
                it('goes to the last page when a large number is entered', function(){
                    var renderStub;

                    table.render();

                    renderStub = sinon.stub(table, 'render');

                    table.$('p.jumpToPage input').val('20000000');
                    table.$('p.jumpToPage button').click();

                    expect(table.pager.currentPage).toEqual(2);
                    expect(renderStub.calledOnce).toEqual(true);

                    renderStub.restore();
                });
                it('sets input to invalid & clears when a non-numeric value entered', function(){
                    var renderStub;

                    table.render();

                    renderStub = sinon.stub(table, 'render');

                    table.$('p.jumpToPage input').val('breaken');
                    table.$('p.jumpToPage button').click();

                    expect(renderStub.called).toEqual(false);
                    expect(table.$('p.jumpToPage input').hasClass('invalid')).toEqual(true);

                    renderStub.restore();
                });
            });
            describe('removeColumns', function(){
                beforeEach(function(){
                    table = tabler.create([
                        {field: 'column1', groupName: 'Group 1', title: 'column1'},
                        {field: 'column2', groupName: 'Group 1', title: 'column1'},
                        {field: 'column3', groupName: 'Group 1', title: 'column1'},
                        {field: 'column4', groupName: 'Group 2', title: ''},
                        {field: 'column5', groupName: 'Group 2', title: 'column1', toggleable: false}
                    ], {plugins: [columnGrouper, removeColumns]});

                    table.load([
                        {column1: '1a', column2: '2a', column3: '3a', column4: '4a', column5: '5a'},
                        {column1: '1b', column2: '2b', column3: '3b', column4: '4b', column5: '5b'},
                        {column1: '1c', column2: '2c', column3: '3c', column4: '4c', column5: '5c'},
                        {column1: '1d', column2: '2d', column3: '3d', column4: '4d', column5: '5d'},
                        {column1: '1e', column2: '2e', column3: '3e', column4: '4e', column5: '5e'}
                    ]);
                    table.render();
                });
                it('renders a remove link in every toggleable column header', function(){
                    expect(table.$('thead tr:last th:eq(0) a.removeColumn').length).toEqual(1);
                    expect(table.$('thead tr:last th:eq(1) a.removeColumn').length).toEqual(1);
                    expect(table.$('thead tr:last th:eq(2) a.removeColumn').length).toEqual(1);
                    expect(table.$('thead tr:last th:eq(3) a.removeColumn').length).toEqual(0);
                    expect(table.$('thead tr:last th:eq(4) a.removeColumn').length).toEqual(0);
                });
                it('renders a remove link in every toggleable column group header', function(){
                    expect(table.$('thead tr.columnGroups th:eq(0) a.removeColumn').length).toEqual(1);
                    expect(table.$('thead tr.columnGroups th:eq(1) a.removeColumn').length).toEqual(0);
                });
                it('wraps each th contents in a span', function(){
                    expect(table.$('thead tr:eq(0) th > span').length).toEqual(table.$('thead tr:eq(0) th').length);
                    expect(table.$('thead tr:eq(1) th > span').length).toEqual(table.$('thead tr:eq(1) th').length);
                });
                it('disables the column on click of a.removeColumn', function(){
                    table.$('thead tr:last th:eq(0) a.removeColumn').click();

                    expect(table.spec[0].disabled).toEqual(true);
                    expect(table.spec[1].disabled).not.toBeDefined();
                    expect(table.spec[2].disabled).not.toBeDefined();
                    expect(table.spec[3].disabled).not.toBeDefined();
                    expect(table.spec[4].disabled).not.toBeDefined();
                });
                it('disables the column group on click of a.removeColumn', function(){
                    table.$('thead tr.columnGroups th:eq(0) a.removeColumn').click();

                    expect(table.spec[0].disabled).toEqual(true);
                    expect(table.spec[1].disabled).toEqual(true);
                    expect(table.spec[2].disabled).toEqual(true);
                    expect(table.spec[3].disabled).not.toBeDefined();
                    expect(table.spec[4].disabled).not.toBeDefined();
                });
                it('can disable a column group when extra columns added to that column group after init', function(){
                    table.addToSpec({
                        field: 'column6',
                        groupName: 'Group 1',
                        title: 'column6'
                    });

                    table.render();
                    table.$('thead tr.columnGroups th:eq(0) a.removeColumn').click();

                    expect(table.spec[0].disabled).toEqual(true);
                    expect(table.spec[1].disabled).toEqual(true);
                    expect(table.spec[2].disabled).toEqual(true);
                    expect(table.spec[3].disabled).not.toBeDefined();
                    expect(table.spec[4].disabled).not.toBeDefined();
                    expect(table.spec[5].disabled).toEqual(true);
                });
                it('raises columnsToggle on click of a.removeColumn', function(){
                    var columnsToggledSpy = sinon.spy();

                    table.bind('columnsToggled', columnsToggledSpy);

                    table.$('thead tr.columnGroups th:eq(0) a.removeColumn').click();

                    expect(columnsToggledSpy.calledOnce).toEqual(true);
                });
            });
            describe('infiniTable', function(){
                var table, fetchSpy, $div;
                beforeEach(function(){
                    $div = $('<div />')
                        .css({
                            height: 200,
                            overflow: 'auto'
                        })
                        .appendTo('body');
                    table = tabler.create([
                        {field: "column1", groupName: 'Group 1', title: 'column1'},
                        {field: "column2", groupName: 'Group 1', title: 'column1'},
                        {field: "column3", groupName: 'Group 1', title: 'column1'},
                        {field: "column4", groupName: 'Group 2', title: ''},
                        {field: "column5", groupName: 'Group 2', title: 'column1', toggleable: false}
                    ], {plugins: [pager, infiniTable]}, {pager: {pageSize: 20}});
                    fetchSpy = sinon.spy(table, 'fetch');

                    table.$el.appendTo($div);

                    table.load(_(_.range(50)).map(function(i){
                                return {column1: '1-' + (i+1), column2: '2-' + (i+1), column3: '3-' + (i+1), column4: '4-' + (i+1), column5: '5-' + (i+1)};
                            }));
                    table.render();
                });
                afterEach(function(){
                    $div.remove();
                });
                it('depends on the paging plugin', function(){
                    var err;
                    try{
                        table = tabler.create({plugins: [infiniTable]});
                    }catch(e){
                        err = e;
                    }
                    expect(err).toBeDefined();
                    expect(err.message).toEqual('infiniTable plugin cannot be used without the pager plugin');
                });
                it('only fetches one set of data at first', function(){
                    expect(fetchSpy.calledOnce).toEqual(true);
                });
                it('renders "Loading more" text instead of page links', function(){
                    expect(table.$('tfoot tr').length).toEqual(1);
                    expect(table.$('tfoot td').length).toEqual(1);
                    expect(table.$('tfoot td').attr('colspan')).toEqual('5');
                    expect(table.$('tfoot td *').length).toEqual(1);
                    expect(table.$('tfoot td span').text()).toEqual('Loading more...');
                    expect(table.$('tfoot td span').hasClass('loading')).toEqual(true);
                });
                it('loads more data when "Loading more" text scrolls into view', function(){
                    fetchSpy.reset();

                    $div.scrollTop(1000).scroll();

                    expect(fetchSpy.calledOnce).toEqual(true);

                    fetchSpy.restore();
                });
                it('does not load more data when container is scrolled and "Loading more" message is not in view', function(){
                    fetchSpy.reset();

                    $div.scrollTop(1).scroll();

                    expect(fetchSpy.called).toEqual(false);

                    fetchSpy.restore();
                });
                it('renders fetched data after existing data in table', function(){
                    $div.scrollTop(1000).scroll();

                    expect(table.$('tbody tr').length).toEqual(40);
                });
                it('removes "Loading more" text when no more pages of data to load', function(){
                    $div.scrollTop(1000).scroll();
                    $div.scrollTop(1000).scroll();
                    $div.scrollTop(1000).scroll();

                    expect(table.$('tbody tr').length).toEqual(50);
                    expect(table.$('tfoot').length).toEqual(0);
                });
                it('renders more pages correctly when fetch is overridden on the table', function(){
                    table.fetch = function(options, callback){
                        callback({
                            totalResults: 25,
                            items: [
                                {column1: '1-1', column2: '2-1', column3: '3-1', column4: '4-1', column5: '5-1'},
                                {column1: '1-2', column2: '2-2', column3: '3-2', column4: '4-2', column5: '5-2'},
                                {column1: '1-3', column2: '2-3', column3: '3-3', column4: '4-3', column5: '5-3'},
                                {column1: '1-4', column2: '2-4', column3: '3-4', column4: '4-4', column5: '5-4'},
                                {column1: '1-5', column2: '2-5', column3: '3-5', column4: '4-5', column5: '5-5'}
                            ]
                        });
                    };

                    $div.scrollTop(1000).scroll();

                    expect(table.$('tbody tr').length).toEqual(25);

                    //$div = $(); // Testing so don't want to remove the real $div
                });
            });
        });
    });
});