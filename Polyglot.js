/*:
* @author browearekissing
* @plugindesc Easy multilingual support for dubs.
* @help 
        -How to use it?-
    First, add the different dubs you'll be using in the parameter tab. Usually, it shouldn't be more than two letters, though you can go for more. As an example, if you have an English and a Japanese dub, you should add "EN" and then "JP".
    It should be displayed like this:

        Dubs            ["EN", "JP"]

    When it is done, add your voicelines in the "audio/se" folder inside your project.
    The naming is really, REALLY important. As an example, if you are using an English and a Japanese dub, you'll have two files for the same voiceline. They should be named like this:

        char01_hello_EN -> This will be played when the player use the English dub
        char01_hello_JP -> This will be played then the player use the Japanese dub

        -Plugin Commands-
    Polyglot play <voiceline name> ~ plays the voiceline.

        -Important notes-
    If you want to play the soundfile "char01_hello_EN", you should use "Polyglot play char01_hello" and NOT "Polyglot play char01_hello_"
 
*
* @param Dubs
* @type text[]
*
*/

/*
* Version 1.0 26/08/2021 ~ Polyglot now works.
*
*/

// == Init ==
var $Polyglot = null;

function Polyglot() {
    this.currDub = "";
};

// == Save & Load
var createGameObjectAlias = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    createGameObjectAlias.call(this);

    $Polyglot = new Polyglot();
};

var makeSaveContentsAlias = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    var contents = makeSaveContentsAlias.call(this);

    contents.Polyglot = $Polyglot;
    return contents;
};

var extractSaveContentsAlias = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    extractSaveContentsAlias.call(this, contents);

    if (contents.Polyglot) {
        $Polyglot = contents.Polyglot;
    }
};

// == Functions ==

function playVoiceline(voicelineName) {
    var lang = $Polyglot.currDub; //get the language from the player

    AudioManager.playSe({name: voicelineName + "_" + lang, volume: 100, pitch:100, pan:0});
};

function initDub() {
    var value = PluginManager.parameters('Polyglot')['Dubs'];
    var parsedValue = JSON.parse(value);


    $gameMessage.add("Choose the language you want to use.");
    $gameMessage.setChoices(parsedValue,0, 0);
    $gameMessage.setChoiceCallback(
        function(choice) {
            $Polyglot.currDub = parsedValue[choice];
        }
    )
}


// == Plugin Commands ==
(function() {
    var pluginCommandsAlias = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        pluginCommandsAlias.call(this, command, args);

        if (command == "Polyglot") {
            switch (args[0]) {
                case "play":
                    playVoiceline(args[1]);
                    break;
                case "init":
                    initDub();
                    break;
            }

        }
        return true;
    };
})();