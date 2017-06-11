var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('ehr.db');
var _ = require('lodash');
var fs = require('fs');
var Chance = require('chance');
var chance = new Chance();

for (var i = 1; i <= 300000; i++) {
  db.serialize(function() {
    var patientId = i;

    var query = "";
    query += 'SELECT *';
    query += ' FROM patient pat ';
    query += ' LEFT JOIN diagnosis dia    ON pat.patientid = dia.patientid';
    query += ' LEFT JOIN encounter enc    ON pat.patientid = enc.patientid';
    query += ' LEFT JOIN prescription pre ON pat.patientid = pre.patientid';
    query += ' LEFT JOIN labresult lab    ON pat.patientid = lab.patientid';
    query += ' LEFT JOIN  measurement mea ON enc.encounterid= mea.encounterid';
    query += ' WHERE pat.patientid = ' + patientId + ';';

    var tables = {
      patient:      { root: true, fields: ['patientid', 'age', 'agecat', 'sex', 'race', 'ethnicity', 'state'] },
      diagnosis:    { fields: ['diagnosisid', 'icd9'] },
      encounter:    { fields: ['encounterid', 'payertype', 'reasonforvisit', 'timewithprovider', 'providerspecialty',
                               'dos'] },
      measure:      { fields: ['measureid', 'encounterid', 'measurement', 'measurementvalue'] },
      labresult:    { fields: ['labresultid', 'loinc_num', 'date_result', 'obs_quan'] },
      prescription: { fields: ['prescriptionid', 'drugid'] }
    };

    var data = {};
    db.all(query, function(err, rows) {
      _.each(rows, function(row) {
        _.each(tables, function(v, k) {
          if (v.root) {
            var fields = {};
            _.each(v.fields, function(val, key) {
              if (k === 'patient') {
                data['patientid'] = patientId;
                data['firstname'] = chance.first();
                data['lastname'] = chance.last();
              }
              data[val] = row[val];
            });
          } else {
            var search = {};
            search[v.fields[0]] = row[v.fields[0]];

            var target = {};
            if (!data[k]) {
              data[k] = [];
            }
            target = data[k];

            if (!_.some(target, search)) {
              var fields = {};

              _.each(v.fields, function(val, key) {
                fields[val] = row[val]
              });
              target.push(fields);
            }
          }
        });
      });

      fs.appendFile('db', JSON.stringify(data) + '\n')
    });
  });
}
