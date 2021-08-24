/*:
* @author browearekissing
* @plugindesc "Infopad" plugin
* @help -Plugin Commands-
 Infopad add <character name> ~ Adds a character to the infopad.
 Infopad set <character name> <type of information> <new data> ~ Updates the type of data. If you have a location type of data, then you can do "Infopad set Millia location mansion" to update Millia's location to mansion. 
 Infopad show ~ Shows the infopad.
*
* @param Type of information
* @type text[]
* 
*/

/*
* Version 0.1 22/08/2021 ~ Infopad add works. The code is here at least.
* Version 0.2 23/08/2021 ~ Infopad set works. Groundwork on window.
* version 1.0 23/08/2021 ~ The feature now works. Should be able to display up to 8 different type of data at once in the infopad.
*/

// == Init ==
var $Infopad = null;

Input.keyMapper["79"] = "InfopadMenu";

function Infopad() {
    this.actors = [];
    this.infoPadData = [];
}

function Scene_InfoPadMenu() {
    this.initialize.apply(this, arguments);
}
// == Scene ==

var aliasSceneMapUpdate = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    aliasSceneMapUpdate.call(this);
    if(Input.isTriggered("InfopadMenu")) {
        if ($Infopad.actors.length <= 0) {
            $gameMessage.add("You need more than one user registered in your infopad!");
        } else { 
            SceneManager.push(Scene_InfoPadMenu);   
            //SoundManager.playOk();
        }
    } 
}


Scene_InfoPadMenu.prototype = Object.create(Scene_MenuBase.prototype);
Scene_InfoPadMenu.prototype.constructor = Scene_InfoPadMenu;

Scene_InfoPadMenu.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_InfoPadMenu.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this._infoPadWindow = new Window_InfoPad();
    this._infoPadWindow.setHandler("ok", this.command1.bind(this));
    this._infoPadWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._infoPadWindow);
    var _drawnWindow = false;
}

Scene_InfoPadMenu.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this._infoPadWindow.refresh();
};

Scene_InfoPadMenu.prototype.command1 = function () {
    if (this._infoPadWindow.visible) this._infoPadWindow.activate();
    console.log("OK");
}

Scene_InfoPadMenu.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    if(Input.isTriggered("escape")) {
        SceneManager.pop();
    }
}
// == Window ==
function Window_InfoPad() {
    this.initialize.apply(this, arguments);
}

Window_InfoPad.prototype = Object.create(Window_Selectable.prototype);
Window_InfoPad.prototype.constructor = Window_InfoPad;

Window_InfoPad.prototype.standardBackOpacity = function() {
    return 0;
}

//Most of the code starting from here was taken from the Window_MenuStatus object inside rpg_windows.js, I modified it slightly to work with the Infopad.
Window_InfoPad.prototype.initialize = function() {
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);
    this.setBackgroundType(2)
    this.refresh();
    this.activate();
    this.select(0);
};

Window_InfoPad.prototype.maxItems = function() {
    return $Infopad.actors.length;
};

Window_InfoPad.prototype.drawItem = function(index) {
    this.drawItemImage(index);
    this.drawItemData(index);
};

Window_InfoPad.prototype.drawItemData = function(index) {
    var rect = this.itemRect(index);
    var infoString = "";

    infoString = this.buildString(index);
    this.changePaintOpacity(false);
    this.drawTextEx(infoString, rect.x + Window_Base._faceWidth + this.padding, rect.y);
    this.changePaintOpacity(true);
}

Window_InfoPad.prototype.buildString = function(index) {
    var value = PluginManager.parameters('Infopad')['Type of information'];
    var parsedValue = JSON.parse(value);
    var str = "";

    if (parsedValue.length > 4) {
        for (var i = 0; i < parsedValue.length; i++) {
            if (i%2 == 0) {
                str += parsedValue[i] + ": " + $Infopad.infoPadData[index][i] + "\t";
            } else {
                str += parsedValue[i] + ": " + $Infopad.infoPadData[index][i] + "\n"
            }
        }
    } else {
        for (var i = 0; i < parsedValue.length; i++) {
            str += parsedValue[i] + ": " + $Infopad.infoPadData[index][i] + "\n";
        }
    }

    return str;
}

Window_InfoPad.prototype.drawItemImage = function(index) {
    var actor = $gameActors.actor(findActorData($Infopad.actors[index]).id);
    var rect = this.itemRect(index);
    this.changePaintOpacity(false);
    this.drawActorFace(actor, rect.x + 1, rect.y + 1, Window_Base._faceWidth, Window_Base._faceHeight);
    this.changePaintOpacity(true);
};

Window_InfoPad.prototype.itemHeight = function() {
    var clientHeight = this.height - this.padding * 2;
    return Math.floor(clientHeight / this.numVisibleRows());
};

Window_InfoPad.prototype.numVisibleRows = function() {
    return 4;
};

// == Functions == 
function initInfopadActor(args) {
    var value = PluginManager.parameters('Infopad')['Type of information'];
    var parsedValue = JSON.parse(value);

    let actor = findActorData(args[1]); 
    if (actor === undefined) {
        $gameMessage.add("ERROR ON EVENT: " + this.character(0).event().name + ", Actor "+ args[1] + " doesn't exist!");
    } else if ($Infopad.actors.includes(actor.name)){
        $gameMessage.add(args[1] + " is already in the Infopad!");
        console.log($Infopad.infoPadData);
    } else {
        var dataArray = [];
        $Infopad.actors.push(actor.name);
        parsedValue.forEach(e => dataArray.push("") );
        $Infopad.infoPadData.push(dataArray);
        console.log($Infopad.infoPadData);
        $gameMessage.add("Added " + args[1] + " to Infopad!");
    }
}

function findActorData(name) {
    return $dataActors.find(elem => ((elem !== null) ? elem.name : undefined) == name); //The first element in the actor array is null. It's definitely not possible to check null.name so we need to do something about it.
}

function setNewDataInfoPad(args) {
    var value = PluginManager.parameters('Infopad')['Type of information'];
    var parsedValue = JSON.parse(value);

    let dataType = parsedValue.find(elem => elem == args[2]);
    if (dataType === undefined) {
        $gameMessage.add("ERROR ON EVENT: " + this.character(0).event().name + ", cannot set "+ args[1] + ". Unknown data type! Did you forget to set it in the plugin parameters?");
    } else if ($Infopad.actors.includes(args[1])){
        $Infopad.infoPadData[$Infopad.actors.indexOf(args[1])][parsedValue.indexOf(args[2])] = args[3];
        $gameMessage.add("Settings " + args[1] + "'s " + args[2] + " to " + args[3]);
        console.log($Infopad.infoPadData);
    } else {
        $gameMessage.add(args[1] + " doesn't exist in the infopad.");
    }
}

function showInfopad() {
    console.log("Does nothing :o(");
}

// == Plugin Commands ==
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
                case "show":
                    showInfopad();
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