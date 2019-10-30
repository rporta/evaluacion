var querystring = require('querystring');
var vsprintf = require('sprintf-js').vsprintf;
var sprintf = require('sprintf-js').sprintf;
var exec = require('child_process').exec;
var request = require('request');

// Queda pendiente implementar logs ...
// Queda pendiente implementar el metodo sendToSlack ...

/**
 * [ProcessRequest description] Recorre la lista de request en redis,
 * las procesa y las contesta al hook de slack
 */
var ProcessRequest = function(app) {
    this.app = app;
    this.keys = undefined;
    this.initInterval = undefined;
    this.response_url = undefined;
}

ProcessRequest.prototype.init = function() {
    var self = this;
    self.app.locals.logger.debug("ProcessRequest.prototype.init");
    self.initInterval = setInterval(function() {
        self.getRedisKeys(); // next
    }, 5000);
}
ProcessRequest.prototype.clearInit = function() {
    var self = this;
    self.app.locals.logger.debug("ProcessRequest.prototype.clearInit");
    clearInterval(self.initInterval);
    this.initInterval = undefined;
}

ProcessRequest.prototype.delRedisKeys = function() {
    var self = this;
    self.app.locals.logger.debug("ProcessRequest.prototype.delRedisKeys");
    for (var h in data.keys) {
        var currentKey = data.keys[h];
        // borro keys redis
        try {
            self.app.locals.redis.del(currentKey);
        } catch (e) {
            // implement log, e ...
        }
    }
}

ProcessRequest.prototype.getRedisKeys = function() {
    var self = this;
    // consulto en redis
    self.app.locals.logger.debug("ProcessRequest.prototype.getRedisKeys");
    try {
        self.app.locals.redis.keys('slackcmd-*', (err, rs) => {
            if (!err) {
                self.keys = rs;


                self.keys.forEach(function(key, i) {
                    self.app.locals.redis.get(key, function(dataRs) {
                        dataRs = JSON.parse(dataRs);
                        self.app.locals.logger.debug("dataRs", dataRs);
                        try {
                            self.app.locals.redis.del(key);
                            if (dataRs === false) {
                                // implement log, dataRs === false...
                            } else {
                                var body = querystring.parse(dataRs.body);
                                self.response_url = body.response_url;
                                self.app.locals.logger.debug("self.response_url", self.response_url);

                                self.process(dataRs); // next
                            }
                        } catch (e) {
                            // implement log, e ...
                        }
                    });
                });
            } else {
                // implement log, err... 
            }
        });
    } catch (e) {
        // implement log, e ...
    }
}

ProcessRequest.prototype.process = function(req) {
    var self = this;
    self.app.locals.logger.debug("ProcessRequest.prototype.process");
    var body = querystring.parse(req.body);
    self.app.locals.logger.debug('Raw request body: ' + JSON.stringify(body));

    if (body.text.indexOf('PUBLIC') >= 0) {
        var AUDIENCE = 'in_channel';
        body.text = body.text.replace('PUBLIC ', '');
        body.text = body.text.replace('PUBLIC', '');
    } else {
        var AUDIENCE = 'ephemeral';
    }

    var responseObj = {
        "response_type": AUDIENCE,
        "text": "",
        "attachments": [{
            "text": ""
        }]
    }

    var sender = body.user_name;

    if (typeof req.params.cmd != 'undefined') {
        var cmd = req.params.cmd;
    } else {
        var cmd = body.text.split(' ')[0];
        body.text = body.text.replace(cmd + ' ', '');
        body.text = body.text.replace(cmd, '');
        body.text = body.text.trim();
    }

    var args = (typeof body.text != 'undefined') ? body.text : null;
    var arrArgs = (args != null) ? args.split(' ') : null;

    self.app.locals.logger.debug('Command after processing: ' + cmd);
    self.app.locals.logger.debug('Arguments after processing: ' + body.text);

    var config = self.app.locals.config;

    if (typeof config.commands[cmd] != 'undefined') {
        if (
            (typeof config.commands[cmd].allowedUsers != 'undefined' && config.commands[cmd].allowedUsers.indexOf(sender) >= 0) ||
            (typeof config.commands[cmd].allowedUsers == 'undefined')
        ) {
            var command = config.commands[cmd].cmd;

            if (this.requiredArguments(command) > this.receivedArguments(arrArgs)) {
                responseObj.text = 'Faltan parametros requeridos para ejecutar este comando, consulte /hera help para mas informacion';
                self.sendToSlack(responseObj, {
                    sender: sender,
                    cmd: cmd
                });
                return;
            } else {
                //if (this.noMissingOptArgs(arrArgs, config.commands[cmd].optionalArgs)){
                if (this.receivedArguments(arrArgs) > this.requiredArguments(command) && typeof config.commands[cmd].optionalArgs != 'undefined' && this.supporOptionalArguments(config.commands[cmd].optionalArgs)) {
                    if (typeof config.commands[cmd].alternateCommand != 'undefined') {
                        self.app.locals.logger.debug('Command replaced by the alternateCommand feature');
                        var tempArgs = config.commands[cmd].optionalArgs;
                        command = config.commands[cmd].alternateCommand.replace(/\[optionalArgs\]/g, function(placeholder) {
                            placeholder = tempArgs[0];
                            tempArgs.shift();
                            return placeholder;
                        });
                    } else {
                        command += this.getAdditionalArgs(config.commands[cmd].optionalArgs);
                    }
                }
            }

            switch (config.commands[cmd].type) {
                case 'sudo':
                    fullcmd = args;
                    self.app.locals.logger.info('Running command: ' + fullcmd);
                    exec(fullcmd, function(err, stdout, stderr) {
                        if (!err) {
                            responseObj.text = config.commands[cmd].title;
                            responseObj.attachments[0].text = stdout;
                            //self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                            self.sendToSlack(responseObj, {
                                sender: sender,
                                cmd: fullcmd
                            });
                        } else {
                            responseObj.text = 'Error ejecutando comando: ' + JSON.stringify(stderr);
                            self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                            self.sendToSlack(responseObj, {
                                sender: sender,
                                cmd: fullcmd
                            });
                        }
                    })
                    break;
                case 'shell':
                    //fullcmd = command + ' ' + args;
                    fullcmd = vsprintf(command, args.split(' '));
                    self.app.locals.logger.info('Running command: ' + fullcmd);
                    exec(fullcmd, function(err, stdout, stderr) {
                        if (!err) {
                            responseObj.text = config.commands[cmd].title;
                            responseObj.attachments[0].text = stdout;
                            //self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                            self.sendToSlack(responseObj, {
                                sender: sender,
                                cmd: fullcmd
                            });
                        } else {
                            responseObj.text = 'Error ejecutando comando: ' + JSON.stringify(stderr);
                            self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                            self.sendToSlack(responseObj, {
                                sender: sender,
                                cmd: fullcmd
                            });
                        }
                    })
                    break;
                case 'shellcat':
                    fullcmd = vsprintf(command, args.split(' '));
                    self.app.locals.logger.info('Running command: ' + fullcmd);
                    exec(fullcmd, function(err, stdout, stderr) {
                        if (!err) {
                            responseObj.text = config.commands[cmd].title;
                            if (stdout) {
                                responseObj.attachments[0].text = stdout;
                            } else {
                                responseObj.attachments[0].text = 'No se encontro lo que buscabas';
                            }
                            //self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                            self.sendToSlack(responseObj, {
                                sender: sender,
                                cmd: fullcmd
                            });
                        } else {
                            if (stderr == '') {
                                responseObj.text = config.commands[cmd].title;
                                responseObj.attachments[0].text = 'No se encontro lo que buscabas';
                                self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                                self.sendToSlack(responseObj, {
                                    sender: sender,
                                    cmd: fullcmd
                                });
                            } else {
                                responseObj.text = config.commands[cmd].title;
                                responseObj.attachments[0].text = 'Error ejecutando comando: ' + JSON.stringify(stderr);
                                self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                                self.sendToSlack(responseObj, {
                                    sender: sender,
                                    cmd: fullcmd
                                });
                            }
                        }
                    })
                    break;
                case 'json':
                    responseObj.text = config.commands[cmd].title;
                    responseObj.attachments = config.commands[cmd].response;
                    //responseObj.attachments[0].color = "#2eb886";
                    //responseObj.attachments[1].color = "#2eb886";
                    //self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                    self.sendToSlack(responseObj, {
                        sender: sender,
                        cmd: cmd
                    });
                    break;
                case 'query':
                    query = vsprintf(config.commands[cmd].query, args.split(' '));
                    self.app.locals.logger.info('Running query: ' + query);
                    if (query.split(' ')[0].toUpperCase == 'EXEC') {
                        self.app.locals.mssql.execute(query, function(rs) {
                            responseObj.text = config.commands[cmd].title;
                            if (rs.length > 0) {
                                responseObj.attachments = JSON.stringify(this.prettyResultset(rs));
                            } else {
                                responseObj.attachments[0].text = 'No se encontro registro'
                            }
                            //self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                            self.sendToSlack(responseObj, {
                                sender: sender,
                                cmd: query
                            });
                        });
                    } else {
                        self.app.locals.mssql.query(query, function(rs) {
                            responseObj.text = config.commands[cmd].title;
                            if (rs.length > 0) {
                                responseObj.attachments = JSON.stringify(this.prettyResultset(rs));
                            } else {
                                responseObj.attachments[0].text = 'No se encontro registro'
                            }
                            //self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                            self.sendToSlack(responseObj, {
                                sender: sender,
                                cmd: query
                            });
                        });
                    }
                    break;
                case 'image':
                    responseObj.text = config.commands[cmd].title;
                    responseObj.image_url = config.commands[cmd].image
                    responseObj.attachments[0].text = '2019';
                    responseObj.attachments[0].image_url = config.commands[cmd].image;
                    self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                    self.sendToSlack(responseObj, {
                        sender: sender,
                        cmd: cmd
                    });
                    break;
                case 'api':
                    var headers = {
                        'Content-Type': 'application/json'
                    }
                    var options = {
                        url: vsprintf(config.commands[cmd].endpoint, args.split(' ')),
                        timeout: 3000,
                        method: 'GET',
                        headers: headers
                    };
                    request(options, function(err, res, body) {
                        var rs = JSON.parse(body);
                        responseObj.text = config.commands[cmd].title;
                        responseObj.attachments[0].text = JSON.stringify(rs.short_url);
                        //self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                        self.sendToSlack(responseObj, {
                            sender: sender,
                            cmd: cmd
                        });
                    })
                    break;
                default:
                    responseObj.text = config.commands[cmd].title;
                    responseObj.attachments[0].text = 'Tipo de comando no soportado';
                    self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
                    self.sendToSlack(responseObj, {
                        sender: sender,
                        cmd: cmd
                    });
                    break;
            }
        } else {
            responseObj.text = 'No tienes permiso para ejecutar este comando';
            self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
            self.sendToSlack(responseObj, {
                sender: sender,
                cmd: cmd
            });
        }
    } else {
        responseObj.text = 'Comando inexistente';
        self.app.locals.logger.debug('Response: ' + JSON.stringify(responseObj));
        self.sendToSlack(responseObj, {
            sender: sender,
            cmd: cmd
        });
    }
}

ProcessRequest.prototype.requiredArguments = function(cmd) {
    var self = this;
    self.app.locals.logger.debug("ProcessRequest.prototype.requiredArguments");
    var regex = /%s/g,
        result, index = [];
    while ((result = regex.exec(cmd))) {
        index.push(result.index);
    }
    return index.length;
}

ProcessRequest.prototype.receivedArguments = function(arrArgs) {
    var self = this;
    self.app.locals.logger.debug("ProcessRequest.prototype.receivedArguments");
    return (arrArgs != null && arrArgs[0] != '') ? arrArgs.length : 0;
}


ProcessRequest.prototype.supporOptionalArguments = function(optionalArgs) {
    var self = this;
    self.app.locals.logger.debug("ProcessRequest.prototype.supporOptionalArguments");
    return (optionalArgs.length) || false;
}

ProcessRequest.prototype.noMissingOptArgs = function(args, optionalArgs) {
    var self = this;
    self.app.locals.logger.debug("ProcessRequest.prototype.noMissingOptArgs");
    return (args.length == optionalArgs.length) || false;
    /*for (var i in optionalArgs){
        return (args.length == i) || false;
    }*/
}

ProcessRequest.prototype.getAdditionalArgs = function(optionalArgs) {
    var self = this;
    self.app.locals.logger.debug("ProcessRequest.prototype.getAdditionalArgs");
    var args = '';
    for (arg in optionalArgs) {
        args += optionalArgs[arg];
    }
    return args;
}

ProcessRequest.prototype.prettyResultset = function(rs) {
    var self = this;
    self.app.locals.logger.debug("ProcessRequest.prototype.prettyResultset");
    var result = [],
        line;
    for (i in rs) {
        line = '';
        if (i == 0) {
            for (header in rs[i]) {
                line += header.toUpperCase() + ' | ';
            }
            line = line.substring(0, (line.length - 3));
            result.push({
                text: line.trim()
            });
            line = '';
        }

        for (field in rs[i]) {
            line += this.fixDate(rs[i][field]) + ' | ';
        }
        line = line.substring(0, (line.length - 3));
        result.push({
            text: line.trim()
        });
    }
    return result;
}

ProcessRequest.prototype.fixDate = function(value) {
    var self = this;
    self.app.locals.logger.debug("ProcessRequest.prototype.fixDate");
    if (String(value).match(/^(\d{4})-(\d{2})-(\d{2})T/)) {
        value = value.substring(0, 10);
    }
    return value;
}

ProcessRequest.prototype.sendToSlack = function(rs, data) {
    var self = this;
    self.app.locals.logger.debug("ProcessRequest.prototype.sendToSlack");

    self.app.locals.logger.info(data.sender + ' ejecuto la siguiente accion: ' + data.cmd);

    // implementar enviar solicitud al hook de slack
    var options = {
        url: self.response_url,
        headers: {
            'Content-type': 'application/json'
        },
        method: "POST",
        json: rs
    };

    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body.id) // Print the shortened url.
        }
    });
}

module.exports = ProcessRequest;
