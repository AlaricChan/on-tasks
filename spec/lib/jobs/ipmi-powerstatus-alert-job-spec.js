'use strict';

var uuid = require('node-uuid');

describe(require('path').basename(__filename), function(){
    var jobClass,
        alertJob;
    var powerStatusCommandResult = {
        "timestamp": "Thu Sep 14 2017 10:10:27 GMT+0000 (UTC)",
        "workItemId": "59b94336ff5383f24950c844",
        "powerStatus": {
            "power": "ON"
        },
        "node": "59b24af530424f1d0853d0c5",
        "host": "172.31.128.67",
        "user": "admin"
    };

    before(function(){
        helper.setupInjector([
            helper.require('/lib/jobs/ipmi-powerstatus-alert-job.js'),
            helper.require('/lib/jobs/poller-alert-job.js'),
            helper.require('/lib/jobs/base-job.js')
        ]);
        jobClass = helper.injector.get('Job.Poller.Alert.Ipmi.PowerStatus');
    });

    beforeEach(function(){
        alertJob = new jobClass({}, { graphId: uuid.v4() }, uuid.v4());
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function(){
        this.sandbox.restore();
    });

    describe('_formatPowerStatusAlert', function(){
        it('should format alert data with power status command result', function(){
            var alertInfoPromise = alertJob._formatPowerStatusAlert(powerStatusCommandResult);
            expect(alertJob.cachedPowerState["59b94336ff5383f24950c844"]).to.equal('ON');
        });
    });

    describe('_determineAlert', function(){
        it('should send alert when power status changed', function(){
            this.sandbox.stub(alertJob, '_formatPowerStatusAlert').resolves('true');
            var determinePromise = alertJob._determineAlert(powerStatusCommandResult);
            return determinePromise.then(function(result){
                expect(result).to.equal('true');
            });
        });
    });

    describe('_determineAlert', function(){
        it('should not send alert when power status did not change', function(){
            alertJob.cachedPowerState["59b94336ff5383f24950c844"] = 'ON';
            var determinePromise = alertJob._determineAlert(powerStatusCommandResult);
            expect(determinePromise).to.be.a('undefined');
        });
    });

    describe('_determineAlert', function(){
        it('should handle a empty parameter', function(){
            var determinePromise = alertJob._determineAlert(null);
            return determinePromise.then(function(value){
                expect(value).to.be.a('undefined');
            });
        });
    });
});
