/** @jsx React.DOM */

var _ = require("underscore");
var React = require("react/addons");
var AppBreadcrumbsComponent = require("../components/AppBreadcrumbsComponent");
var AppVersionListComponent = require("../components/AppVersionListComponent");
var TabPaneComponent = require("../components/TabPaneComponent");
var TaskDetailComponent = require("../components/TaskDetailComponent");
var TaskViewComponent = require("../components/TaskViewComponent");
var TogglableTabsComponent = require("../components/TogglableTabsComponent");

var tabsTemplate = [
  {id: "apps/:appid", text: "Tasks"},
  {id: "apps/:appid/configuration", text: "Configuration"}
];

var AppPageComponent = React.createClass({
  displayName: "AppPageComponent",

  propTypes: {
    activeTask: React.PropTypes.object,
    appVersionsFetchState: React.PropTypes.number.isRequired,
    model: React.PropTypes.object.isRequired,
    destroyApp: React.PropTypes.func.isRequired,
    fetchTasks: React.PropTypes.func.isRequired,
    fetchAppVersions: React.PropTypes.func.isRequired,
    handleSetAppView: React.PropTypes.func.isRequired,
    onDestroy: React.PropTypes.func.isRequired,
    onShowTaskDetails: React.PropTypes.func.isRequired,
    onShowTaskList: React.PropTypes.func.isRequired,
    onTasksKilled: React.PropTypes.func.isRequired,
    restartApp: React.PropTypes.func.isRequired,
    rollBackApp: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
    scaleApp: React.PropTypes.func.isRequired,
    suspendApp: React.PropTypes.func.isRequired,
    tasksFetchState: React.PropTypes.number.isRequired
  },

  getInitialState: function () {
    var appid = this.props.model.get("id");
    var activeTabId;

    var tabs = _.reduce(tabsTemplate, function (current, tab) {
      var id = tab.id.replace(":appid", encodeURIComponent(appid));
      if (activeTabId == null) {
        activeTabId = id;
      }
      current.push({
        id: id,
        text: tab.text
      });

      return current;
    }, []);

    return {
      activeViewIndex: 0,
      activeTabId: activeTabId,
      tabs: tabs
    };
  },

  componentDidMount: function () {
    this.props.handleSetAppView(function (appid, view) {
      if (appid) {
        this.setState({
          activeTabId: "apps/" +
            encodeURIComponent(appid) +
            (view ? "/" + view : "")
        });
      }
    }.bind(this));

    this.setState({
      activeTabId: this.props.router.currentHash()
    });
  },

  componentWillUnmount: function () {
    this.props.handleSetAppView(_.noop);
  },

  handleDestroyApp: function () {
    this.props.destroyApp();
    this.onDestroy();
  },

  handleRestartApp: function () {
    this.props.restartApp();
  },

  onTabClick: function (id) {
    this.setState({
      activeTabId: id
    });
  },

  showTaskDetails: function (task) {
    this.props.onShowTaskDetails(task, function () {
      this.setState({
        activeViewIndex: 1
      });
    }.bind(this));
  },

  showTaskList: function () {
    this.props.onShowTaskList();
    this.setState({
      activeViewIndex: 0
    });
  },

  scaleApp: function () {
    var model = this.props.model;
    var instancesString = prompt("Scale to how many instances?",
      model.get("instances"));

    // Clicking "Cancel" in a prompt returns either null or an empty String.
    // perform the action only if a value is submitted.
    if (instancesString != null && instancesString !== "") {
      var instances = parseInt(instancesString, 10);
      this.props.scaleApp(instances);
    }
  },

  getControls: function () {
    if (this.state.activeViewIndex !== 0) {
      return null;
    }

    /* jshint trailing:false, quotmark:false, newcap:false */
    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
    return (
      <div className="header-btn">
        <button className="btn btn-sm btn-default"
            onClick={this.props.suspendApp}
            disabled={this.props.model.get("instances") < 1}>
          Suspend
        </button>
        <button className="btn btn-sm btn-default" onClick={this.scaleApp}>
          Scale
        </button>
        <button className="btn btn-sm btn-danger pull-right"
          onClick={this.handleDestroyApp}>
          Destroy App
        </button>
        <button className="btn btn-sm btn-default pull-right"
          onClick={this.handleRestartApp}>
          Restart App
        </button>
      </div>
    );
    /* jshint trailing:true, quotmark:true, newcap:true */
    /* jscs:enable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
  },

  getTaskDetailComponent: function () {
    var model = this.props.model;

    /* jshint trailing:false, quotmark:false, newcap:false */
    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
    return (
      <TaskDetailComponent
        fetchState={this.props.tasksFetchState}
        taskHealthMessage={model.formatTaskHealthMessage(this.props.activeTask)}
        hasHealth={model.hasHealth()}
        onShowTaskList={this.showTaskList}
        task={this.props.activeTask} />
    );
    /* jshint trailing:true, quotmark:true, newcap:true */
    /* jscs:enable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
  },

  getAppDetails: function () {
    var model = this.props.model;

    /* jshint trailing:false, quotmark:false, newcap:false */
    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
    return (
      <TogglableTabsComponent className="page-body page-body-no-top"
          activeTabId={this.state.activeTabId}
          onTabClick={this.onTabClick}
          tabs={this.state.tabs} >
        <TabPaneComponent
          id={"apps/" + encodeURIComponent(model.get("id"))}>
          <TaskViewComponent
            collection={model.tasks}
            fetchState={this.props.tasksFetchState}
            fetchTasks={this.props.fetchTasks}
            formatTaskHealthMessage={model.formatTaskHealthMessage}
            hasHealth={model.hasHealth()}
            onTasksKilled={this.props.onTasksKilled}
            onTaskDetailSelect={this.showTaskDetails} />
        </TabPaneComponent>
        <TabPaneComponent
          id={"apps/" + encodeURIComponent(model.get("id")) + "/configuration"}
          onActivate={this.props.fetchAppVersions} >
          <AppVersionListComponent
            app={model}
            fetchAppVersions={this.props.fetchAppVersions}
            fetchState={this.props.appVersionsFetchState}
            onRollback={this.props.rollBackApp} />
        </TabPaneComponent>
      </TogglableTabsComponent>
    );
    /* jshint trailing:true, quotmark:true, newcap:true */
    /* jscs:enable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
  },

  render: function () {
    var content;
    var model = this.props.model;
    var statusClassSet = React.addons.classSet({
      "text-warning": model.isDeploying()
    });

    if (this.state.activeViewIndex === 0) {
      content = this.getAppDetails();
    } else if (this.state.activeViewIndex === 1)  {
      content = this.getTaskDetailComponent();
    }

    /* jshint trailing:false, quotmark:false, newcap:false */
    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
    return (
      <div>
        <AppBreadcrumbsComponent
          activeTask={this.props.activeTask}
          activeViewIndex={this.state.activeViewIndex}
          model={model}
          onDestroy={this.props.onDestroy}
          showTaskList={this.showTaskList} />
        <div className="container-fluid">
          <div className="page-header">
            <span className="h3 modal-title">{model.get("id")}</span>
            <ul className="list-inline list-inline-subtext">
              <li>
                <span className={statusClassSet}>
                  {model.getStatus()}
                </span>
              </li>
            </ul>
            {this.getControls()}
          </div>
          {content}
        </div>
      </div>
    );
  }
});

module.exports = AppPageComponent;
