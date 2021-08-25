/*:
* @author browearekissing
* @plugindesc Jukebox plugin for Rakuen
* @help -Plugin Commands-

 Jukebox add <song name> ~ Adds a song to the jukebox. The song name should be the name of the song in your project.
 Jukebox show ~ Shows the jukebox menu. Should be added on something interactable.
*
*
*/
var $Jukebox = null;

function Jukebox() {
    this.songArray = [];
}

function displayJukeboxMenu() {
    $gameMessage.add("Choose the music you want to play.");
    $gameMessage.setChoices($Jukebox.songArray,0, 0);
    $gameMessage.setChoiceCallback(
        function(choice) {
            AudioManager.playBgm({name: $Jukebox.songArray[choice], volume: 100, pitch:100, pan:0})
        }
    )
}

(function() {
    var pluginCommandsAlias = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        pluginCommandsAlias.call(this, command, args);

        if (command == "Jukebox") {
            switch (args[0]) {
                case "show":
                    console.log("Show jukebox");
                    if ($Jukebox.songArray.length < 1) {
                        $gameMessage.add("You need at least one song added!");
                    } else {
                        displayJukeboxMenu();
                    }
                    break;
                case "add":
                    console.log("Adding" + args[1]);
                    $Jukebox.songArray.push(args[1]);
                    console.log($Jukebox.songArray.toString());
                    $gameMessage.add("Adding" + args[1] + "to jukebox player.");
                    break;
            }

        }


        return true;
    };

    var createGameObjectAlias = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        createGameObjectAlias.call(this);

        $Jukebox = new Jukebox();
    };

    var makeSaveContentsAlias = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        var contents = makeSaveContentsAlias.call(this);

        contents.Jukebox = $Jukebox;
        return contents;
    }

    var extractSaveContentsAlias = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        extractSaveContentsAlias.call(this, contents);

        if (contents.Jukebox) {
            $Jukebox = contents.Jukebox;
        }
    }
})();
