'use strict';

var di = require('di');

module.exports = ipmiPowerStatusPollerAlertJobFactory;

di.annotate(ipmiPowerStatusPollerAlertJobFactory, new di.Provide('Job.Poller.Alert.Ipmi.PowerStatus'));

di.annotate(ipmiPowerStatusPollerAlertJobFactory, new di.Inject(
    'Job.Poller.Alert',
    'Logger',
    'Util',
    'Assert',
    'Promise',
    '_',
    'Services.Waterline',
    'Services.Environment'
));

function ipmiPowerStatusPollerAlertJobFactory(
    PollerAlertJob,
    Logger,
    util,
    assert,
    Promise,
    _,
    waterline,
    env
) {

    var logger = Logger.initialize(ipmiPowerStatusPollerAlertJobFactory);

    /**
    *
    * @param {Object} options
    * @param {Object} context
    * @param {String} taskId
    * @constructor
    */
    function IpmiPowerStatusPollerAlertJob(options, context, taskId) {
        this.cachedPowerState = {};
        assert.object(context);
        assert.uuid(context.graphId);
        var subscriptionArgs = [context.graphId, 'powerStatus'];
        IpmiPowerStatusPollerAlertJob.super_.call(this, logger, options, context, taskId,
                    '_subscribeIpmiCommandResult', subscriptionArgs);
    }

    util.inherits(IpmiPowerStatusPollerAlertJob, PollerAlertJob);

    IpmiPowerStatusPollerAlertJob.prototype._formatPowerStatusAlert = function _formatPowerStatusAlert(data) {
        var self = this;
        var alertData = {
            type: 'polleralert',
            action: 'power.changed',
            typeId: data.workItemId,
            nodeId: data.node,
            severity: 'information',
            data: {
                PowerStatus: {
                    Previous: self.cachedPowerState[data.workItemId] ? self.cachedPowerState[data.workItemId] : 'Unknown',
                    Current: data.powerStatus.power
                }
            }
        };
        self.cachedPowerState[data.workItemId] = data.powerStatus.power;
        var result = [ alertData ];
        return Promise.resolve(result);
    };

    IpmiPowerStatusPollerAlertJob.prototype._determineAlert = function _determineAlert(data) {
        var self = this;
        if(!data) {
            return Promise.resolve();
        }
        if(self.cachedPowerState[data.workItemId]){
            if(self.cachedPowerState[data.workItemId] === data.powerStatus.power){
                return;
            }
        }
        logger.debug('Power status changed to: ' + data.powerStatus.power);
        return self._formatPowerStatusAlert(data);
    };

    return IpmiPowerStatusPollerAlertJob;
}
