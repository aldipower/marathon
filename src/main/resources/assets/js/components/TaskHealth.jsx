/** @jsx React.DOM */

var React = require("react/addons");

var TimeField = require("../components/TimeField");

module.exports = React.createClass({
  displayName: "TaskHealth",
  propTypes: {
    task: React.PropTypes.object.isRequired
  },
  render: function () {
    var task = this.props.task;
    var healthCheckResults = task.get("healthCheckResults");
    var healthNodeList;

    if (healthCheckResults != null) {
      healthNodeList = healthCheckResults.map(function (cResult, index) {
        if (cResult != null) {
          var timeNodes = [
            {
              label: "First success",
              time: cResult.firstSuccess
            }, {
              label: "Last success",
              time: cResult.lastSuccess
            }, {
              label: "Last failure",
              time: cResult.lastFailure
            }
          ];
          var timeFields = timeNodes.map(function (timeNode, index) {

            /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
            /* jshint trailing:false, quotmark:false, newcap:false */
            return (
              <TimeField
                key={index}
                label={timeNode.label}
                time={timeNode.time} />
            );
          });
          return (
            <div key={index}>
              <hr key={"hr-" + index} />
              <h5>
                Health Check Result {index + 1}
              </h5>
              <dl className="dl-horizontal">
                {timeFields}
                <dt>Consecutive failures</dt>
                {cResult.consecutiveFailures == null ?
                  <dd className="text-muted">None</dd> :
                  <dd>{cResult.consecutiveFailures}</dd>}
                <dt>Alive</dt>
                {cResult.alive == null ?
                  <dd>No</dd> :
                  <dd>Yes</dd>}
              </dl>
            </div>
          );
        }
      });
    }

    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
    /* jshint trailing:false, quotmark:false, newcap:false */
    return (
      <div className={this.props.className}>
        {healthNodeList}
      </div>
    );
  }
});