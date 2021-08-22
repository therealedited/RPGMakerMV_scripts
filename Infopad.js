/*:
* @author browearekissing
* @plugindesc "Infopad" plugin
* @help -Plugin Commands-
 Infopad add <character name> ~ Adds a character to the infopad.
 Infopad set <character name> <type of information> <new data> ~ Updates the type of data. If you have a location type of data, then you can do "Infopad set Millia location mansion" to update Millia's location to mansion. 
*
* @param Type of information
* @type text[]
* 
*/

/*
* Version 0.1 22/08/2021 ~ Infopad add works. The code is here at least.
*/

var $Infopad = null;

function Infopad() {
    this.actors = [];
    this.infoPadData = [];
}

function initInfopadActor(args) {
    var value = PluginManager.parameters('Infopad')['Type of information'];
    var parsedValue = JSON.parse(value);

    let actor = $dataActors.find(elem => ((elem !== null) ? elem.name : "") == args[1]);  //Apparently the first element in the actor array is null. It's definitely not possible to check null.name so we need to do something about it.
    if (actor === undefined) {
        $gameMessage.add("ERROR ON EVENT: " + this.character(0).event().name + ", Actor "+ args[1] + " doesn't exist!");
    } else if ($Infopad.actors.includes(actor.name)){
        $gameMessage.add(args[1] + " is already in the Infopad!");
        $Infopad.infoPadData.forEach(element => {
            console.log(element);
        });
    } else {
        var dataArray = [];
        $Infopad.actors.push(actor.name);
        parsedValue.forEach(e => {
            dataArray.push("");
        });
        $Infopad.infoPadData.push(dataArray);
        $Infopad.infoPadData.forEach(element => {
            console.log(element);
        });
        $gameMessage.add("Added " + args[1] + " to Infopad!");
    }
}

function setNewDataInfoPad(args) {
    var value = PluginManager.parameters('Infopad')['Type of information'];
    var parsedValue = JSON.parse(value);


}

(function() {

    var pluginCommandsAlias = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        pluginCommandsAlias.call(this, command, args);

        if (command == "Infopad") {
            switch (args[0]) {
                case "add":
                    initInfopadActor(args);
                    break;
                case "set":
                    setNewDataInfoPad(args);
                    break;
            }

        }


        return true;
    };

    var createGameObjectAlias = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        createGameObjectAlias.call(this);

        $Infopad = new Infopad();
    };

    var makeSaveContentsAlias = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        var contents = makeSaveContentsAlias.call(this);

        contents.Infopad = $Infopad;
        return contents;
    }

    var extractSaveContentsAlias = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        extractSaveContentsAlias.call(this, contents);

        if (contents.Infopad) {
            $Infopad = contents.Infopad;
        }
    }
})();