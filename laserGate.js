/* 
 * @ABroadwell
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//Initialize num of rows and cols to use as the game grid
var numCols = 9;
var numRows = 13;

//set avatar location to be in the center of the bottom row
var avatar = numRows.toString() + "_" + Math.floor(numCols / 2).toString();
//var avatarX;
//var avatarY;
var avatarIsPlaced = false;
var shooting = false;
var boxes = new Array();

//audio initilaization 
var a = document.createElement('audio');
a.setAttribute('src', 'Intro.mp3');

//show users what levels are open to them and which ones are not
var oldGame = false;
if(localStorage.getItem("continue")) {
    oldGame = localStorage.getItem("continue");
}; 
var unlocked = 1;
if (localStorage.getItem("unlockedLevels")) {
    unlocked = localStorage.getItem("unlockedLevels");
}; 

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    navigator.splashscreen.show();
    setTimeout(function () {
    navigator.splashscreen.hide();
    }, 5000);
}

//code goes to menu function first
init();
startScreen(oldGame);


//sets up the game grid 
//puts id's for outer and locations to be used when shooting to test if avatar and laser are in the same row/col
function game(level) {
    var deathBoxCount;
    a.src = 'Game.mp3';
    a.play();
    var id = level;
    document.write('<link rel="stylesheet" type="text/css" href="laserGate.css"/><img id="thing" src="thing.jpg"><div class="laserGate"><table id="grid" border="0" cellspacing = "0" cellpadding = "0" id="a" align = "center">');
    for (i = 0; i <= numRows; i++) {
        document.write("<tr class='row" + i + "'>");
        for (j = 0; j <= numCols; j++) {
            if (j === 0) {
                if (i === 0) {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class='outer top left corner'></td>");
                }
                else if (i === numRows) {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class='outer bottom left corner'></td>");
                }
                else {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class = 'outer left '></td>");
                }
            }
            else if (j === numCols) {
                if (i === 0) {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class='outer corner top right'></td>");
                }
                else if (i === numRows) {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class='outer corner bottom right'></td>");
                }
                else {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class ='outer right'></td>");
                }
            }
            else {
                if (i === 0) {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class = 'outer top'></td>");
                }
                else if (i === numRows) {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class = 'outer bottom'></td>");
                }
                else {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class = 'inner'></td>");
                }
            }
        }
        document.write('</tr></div>');
    }
    ;
    
    // Current score functionality adds 10 points for each box hit and counts the number of shots
    Score = {
        hit : 0,
        shots : 0
    };
    
    
    document.write('</table><button id="menu" align="center">pause</button>');
    document.write('<p id="score">Score: ' + Score.hit + '</p>');


//get cellWidth and cellHeight to be used in placement and in overlap test
    var cellWidth = document.getElementById("0_0").offsetWidth / 2;
    var cellHeight = document.getElementById("0_0").offsetHeight / 2;

    function Box(boxId, hitCount) {
        this.boxId = boxId;
        this.hitCount = hitCount;
    }
    Box.prototype.setHitCount = function(hitCount) {
        this.hitCount = hitCount;
    };
    Box.prototype.getId = function() {
        return this.boxId;
    };

    Box.prototype.getHitCount = function() {
        return this.hitCount;
    };
    Box.prototype.draw = function(id, hitCount) {
        hitCount < 1 ? $("#" + id + "").addClass("unHit").removeClass("hit2") :
                hitCount == 1 ? $("#" + id + "").addClass("hit2").removeClass("hit3") :
                $("#" + id + "").addClass("hit3");
    };

    Box.prototype.boxDim = function(id) {
        var boxPos = getElementPosition(this.getId());
        return {
            left: boxPos.left,
            top: boxPos.top,
            right: boxPos.left + cellWidth,
            bottom: boxPos.top + cellHeight
        };
    };
    

    //used to create the levels
    gameLevels(id);
    function gameLevels(id) {

        //place lasers
        for (var i = 0; i < levels.level[id].laser.length; i++) {
//            console.log(levels.level[id].laser[i].position);
            $("#" + levels.level[id].laser[i].position).text("L").addClass("laser");
        }
        ;

        //place boxes
        //boxes is an array of box objects 
        deathBoxCount = 0;
        for (var j = 0; j < levels.level[id].box.length; j++) {
            boxes[j] = new Box(levels.level[id].box[j].position, levels.level[id].box[j].hitCount);
            var box = boxes[j];
            if (levels.level[id].box[j].deathBox) {
                $("#" + box.getId() + "").addClass("deathBox");
                deathBoxCount++;
            } else {
                box.draw(box.getId(), box.getHitCount());
                console.log("ID " + box.getId() + " HIT COUNT " + box.getHitCount() + " \n\n");
            }
        }
        ;

        //set avatar location
        $("#" + avatar + "").addClass("avatar");
        avatarIsPlaced = true;
    }

//used to get element position 
//@param of id
    function getElementPosition(id) {
        var element = document.getElementById(id);
        var top = 0;
        var left = 0;

        while (element.tagName !== "BODY") {
            top += element.offsetTop;
            left += element.offsetLeft;
            element = element.offsetParent;
        }
        return {top: top, left: left};
    }
    ;

    var grid = document.getElementById("grid");
    for (i = 0; i <= numRows; i++) {
        for (j = 0; j <= numCols; j++) {
            grid.rows[i].cells[j].onclick = function(e) {
                if ($(this).hasClass("outer") && !shooting) {
                    cellWidth = document.getElementById("0_0").offsetWidth / 2;
                    cellHeight = document.getElementById("0_0").offsetHeight / 2;
                    //get top and left coordinates of the new clicked position
                    var currentPosition = $(this).attr("id");
                    var position = getElementPosition(currentPosition);

                    //set appropriate x and y coordinates of the new position
                    var xPosition = setXLocation(this, position);
                    var yPosition = setYLocation(this, position);

                    if ($(this).hasClass("laser") && avatarIsPlaced) {
                        if (checkLocation(currentPosition)) {
                            shooting = true;
                            Score.shots += 1;

                            //fetch avatar location again just to be sure screen wasn't resized
                            var temp = getElementPosition(avatar);
                            var avatarX = temp.left == avatarX ? avatarX : setXLocation(avatar, temp);
                            var avatarY = temp.top == avatarY ? avatarY : setYLocation(avatar, temp);

                            //set the thing to avatar location on a zero transition speed
                            var theThing = document.getElementById("thing");
                            theThing.style.transition = "left 0s ease-in, top 0s ease-in";
                            theThing.style.left = avatarX;
                            theThing.style.top = avatarY;
//                            
                            //make the thing visible and change transition speed back to 1s
                            setTimeout(function() {
                                theThing.style.visibility = "visible";
                                theThing.style.transition = "left 1s ease-in, top 1s ease-in";
                            }, 1);

                            //set new location of the thing, in which it will show the transition to get there
                            setTimeout(function() {
                                var theThing = document.querySelector("#thing");
                                theThing.style.left = xPosition + "px";
                                theThing.style.top = yPosition + "px";
                            }, 1);

                            //check for collisions with box objects
                            var hit = new Array();
                            var j = 0;
                            var testCollision = setInterval(function() {
                                //get the necessary location of the thing at that moment
                                var thingPosition = getElementPosition("thing");
                                var thingLeft = thingPosition.left;
                                var thingTop = thingPosition.top;

                                //test if the laser collides with any boxes
                                for (var i = 0; i < boxes.length; i++) {
                                    var box = boxes[i];
                                    var boxDim = box.boxDim(box.getId());
                                    xOverlap = collides(thingLeft, boxDim.left, boxDim.right) || collides(thingLeft, boxDim.right, boxDim.left);
                                    yOverlap = collides(thingTop, boxDim.top, boxDim.bottom) || collides(thingTop, boxDim.bottom, boxDim.top);
                                    if (xOverlap && yOverlap) {
                                        if (!$("#" + box.getId() + "").hasClass("deathBox")) {
                                            box.setHitCount(box.getHitCount() - 1);
                                            if (box.getHitCount() < 0) {
                                                $("#" + box.getId() + "").addClass("remove");
                                            }
                                            else {
                                                hit[j++] = box;
                                                box.draw(box.getId(), box.getHitCount());
                                            }
                                            boxes.splice(i, 1);
                                            Score.hit += 10;
                                            document.getElementById("score").innerHTML = '<p id="score">Score: ' + Score.hit + '</p>';
                                        } else {
                                            var nextLevel = false;
                                            levels.level[id].won = false;
                                            console.log(levels.level[id].won);
                                            menuOverlay(nextLevel, id, false);
                                            //cannot have option to resume
                                            clearInterval(testCollision);
                                        }
                                    }
                                    if ((boxes.length + hit.length - deathBoxCount) <= 0) {
                                        var nextLevel = true;
                                        levels.level[id].won = true;
                                        id += 1;
                                        unlocked = parseInt(unlocked);
                                        oldgame = true;
                                        if(id === unlocked){ //make sure player does not unlock a level by playing one they already beat
                                        unlocked += 1;
                                        localStorage.setItem("unlockedLevels", unlocked);
                                        localStorage.setItem("continue", oldGame);
                                        };
                                        menuOverlay(nextLevel, id, false);
                                        clearInterval(testCollision);
                                    }
                                }
                            }, 1);
                            setTimeout(function() {
                                clearInterval(testCollision);
                            }, 1000);

                            //after done shooting, hide the thing
                            //THING ABSTRACTION
                            setTimeout(function() {
                                theThing.style.visibility = "hidden";
                                for (var i = 0; i < hit.length; i++) {
                                    boxes[boxes.length] = hit[i];
                                }
                                shooting = false;
                            }, 1000);
                        } 
                } else {
                        //AVATAR ABSTRACTION
                        avatarPlaced = false;
                        shooting = true;
                        $("#" + avatar + "").removeClass("avatar").removeClass('tankBottom').removeClass('tankTop').
                                removeClass('tankRight').removeClass('tankLeft').removeClass('tankUpperLeft').
                                removeClass('tankUpperRight').removeClass('tankLowerLeft').removeClass('tankLowerRight');
                        $(this).addClass("avatar");
                        avatar = currentPosition;
                        avatarPlaced = true;
                        shooting = false;
                        if($("#" + avatar + "").hasClass('top')){
                            $(this).addClass("tankBottom");
                        }
                        if($("#" + avatar + "").hasClass('bottom')){
                            $(this).addClass("tankTop");
                        }
                        if($("#" + avatar + "").hasClass('left')){
                            $(this).addClass("tankRight");
                        }
                        if($("#" + avatar + "").hasClass('right')){
                            $(this).addClass("tankLeft");
                        }
                        if(avatar == '0_0'){
                            $(this).addClass("tankUpperLeft");
                        }
                        if(avatar == '0_9'){
                            $(this).addClass("tankUpperRight");
                        }
                        if(avatar == '13_9'){
                            $(this).addClass("tankLowerRight");
                        }
                        if(avatar == '13_0'){
                            $(this).addClass("tankLowerLeft");
                        }
                    }
                }
            };
        }
    }
    function setXLocation(obj, position) {
        cellWidth = document.getElementById("0_0").offsetWidth / 2;
        return $(obj).hasClass("left") ?
                $(obj).hasClass("laser") ? position.left + cellWidth * 2 : position.left + cellWidth * 2 - $("#thing").width() / 2 :
                $(obj).hasClass("right") ? position.left : position.left + cellWidth - $("#thing").width() / 2;
    }

    function setYLocation(obj, position) {
        cellHeight = document.getElementById("0_0").offsetHeight / 2;
        return $(obj).hasClass("top") ?
                $(obj).hasClass("laser") ? position.top + cellHeight * 2 : position.top + cellHeight * 2 - $("#thing").height() / 2 :
                $(obj).hasClass("bottom") ? position.top :
                position.top + cellHeight + $("#thing").height() / 2;
    }
    function collides(value, min, max) {
        return (value >= min - 20) && (value <= max + 20);
    }
    function checkLocation(laser) {
        return ($("#" + laser + "").hasClass("left") && $(".avatar").hasClass("left")) ? false :
                ($("#" + laser + "").hasClass("right") && $(".avatar").hasClass("right")) ? false :
                ($("#" + laser + "").hasClass("top") && $(".avatar").hasClass("top")) ? false :
                ($("#" + laser + "").hasClass("bottom") && $(".avatar").hasClass("bottom")) ? false : true;
    }

    $("#menu").click(function() {
        menuOverlay(levels.level[level].won, id, true);
    });

}
;

//a screen that says Laser Gate and has a big button to begin the game
function startScreen(cont){
    document.write('<link rel="stylesheet" type="text/css" href="laserGate.css"/><div id="firstPage" class="welcomeScreen"><center><a id="LaserGate"><h1>Laser Gate</h1></a>');
    if(cont){
        document.write('<a href="#" id="welcomeButton" class="myButton">Continue</a><br>');
    }
    document.write('<a class="myButton" id="clearStorage" align="center">New Game</a></center></div>');
    init();
    setInterval(function() {
        a.play();
    }, 1000);
    $('#welcomeButton').on('click touchstart', function() {
        document.body.innerHTML = '';
        menu();
    });

    $('#clearStorage').on('click touchstart', function() {
        //this deletes the game()
        localStorage.clear();
        document.location.replace('');
        document.location.reload();
        menu();
    });
}

function menu() { //this will bring the user back to the level screen so he can pick the next level
    document.write('<link rel="stylesheet" type="text/css" href="laserGate.css"/><div class="menu"><h1><strong>Laser Gate</strong></h1><table id="selector" cellspacing = "15" cellpadding = "10" id="a" align = "center">');
    var numRows = 6;
    var numColmns = 5;
    var blockId = 1;
//    console.log(unlocked);
    for (i = 0; i < numRows; i++) { //the menu table
        document.write('<tr id="row"' + i + '>');

        for (j = 0; j < numColmns; j++) {
            if (blockId <= unlocked) {
                document.write("<td id= '" + blockId.toString() + "' class='unlocked'>" + blockId.toString() + "</td>");
            } else {
                document.write("<td id= '" + blockId.toString() + "' class='locked'>" + blockId.toString() + "</td>");
            }
            blockId++;
        }
        ;
        document.write('</tr>');
    }
    ;
    document.write('</table><button id="returnWelcome">Back to Welcome</button></div>');

    $('#selector td').click(function() { //when you click on a <td> element it will get the id and use that to correlate with the level desired
        var id = $(this).attr('id');
        //checks to see if level has been unlocked then allows you to enter game again
//            console.log("go to level " + id + "");
        if (id <= unlocked) {
//            console.log("go to level " + id + "");
            $('.menu').html(''); //remove everything
            $('div').removeClass("menu");
            var compLevel = id - 1; //I belive this is needed since the level array starts at 0 but my table will have an ID of 1
            a.pause();
            oldGame = true; //used to add contrubute tag to the startscreen
            game(compLevel); //game(id) will be used with a next level function when there is a variety of levels
        };
    });

    $('#returnWelcome').click(function() {
        document.location.replace('');
        startScreen(cont);
    });

}

function menuOverlay(won, id, paused) {
    a.pause();
    document.write('<div class="onTop"><div class="menuOverlay"><center><div id="OverlayOptions" align="center"><a class="onTop" id="menuClick" align="center"><h1><u>menu</u></h1></a><br>');
    if(paused) {
        document.write('<a class="onTop" id="resume" align="center"><h1><u>resume</u></h1></a><br>');
    }
    if (won) {
        document.write('<a class="onTop" id="nextLevel" align="center"><h1><u>next level</u></h1></a><br>');
    }
    document.write('<a class="onTop" id="restart" align="center"><h1><u>restart</u></h1></a></div></center></div></div>');
    $('#menuClick').click(function() {
        //this deletes the game()
        $('.laserGate').html('');
        $('#thing').remove();
        $('div').removeClass('laserGate');
        //this deletes the menuOverlay
        $('.menuOverlay').html('');
        $('div').removeClass('menuOverlay');
        menu();
    });

    $('#nextLevel').click(function() {
        //this deletes the game()
        avatar = numRows.toString() + "_" + Math.floor(numCols / 2).toString(); //reset the avatar
        $('.laserGate').html('');
        $('#thing').remove();
        $('div').removeClass('laserGate');
        //this deletes the menuOverlay
        $('.menuOverlay').html('');
        $('div').removeClass('menuOverlay');
        if (levels.level[id].won) { //fixed bug that if you won a level and went back you couldn't progress to next level until you won again
            id += 1;
        }
        game(id);//will pass in a value that a NEXTLEVEL function will read and change levels with 
    });

    $('#resume').click(function() {
        //this deletes the menuOverlay
        $('.menuOverlay').html('');
        $('div').removeClass('menuOverlay');
    });

    $('#restart').click(function() {
        //this deletes the game()
        avatar = numRows.toString() + "_" + Math.floor(numCols / 2).toString(); //reset the avatar
        $('.laserGate').html('');
        $('#thing').remove();
        $('div').removeClass('laserGate');
        //this deletes the menuOverlay
        $('.menuOverlay').html('');
        $('div').removeClass('menuOverlay');
        game(id);
    });
}
;


//json for the levels in the game 
var levels = {
    level:
            [
                {
                    //level 1
                    won: false,
                    box: [{position: "2_4", hitCount: 2}, {deathBox: true, position: "6_2", hitCount: 0}, {position: "8_7", hitCount: 1}, {position: "7_7", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "1_6", hitCount: 1}, {position: "2_6", hitCount: 0}, {position: "3_6", hitCount: 0}, {position: "4_6", hitCount: 0}],
                    laser: [{position: "0_0"}, {position: "6_0"}, {position: "3_9"}, {position: "13_7"}]
                },
                {
                    //level 2
                    won: false,
                    box: [{position: "1_4", hitCount: 0}, {position: "6_3", hitCount: 0}, {position: "8_8", hitCount: 0}, {position: "7_8", hitCount: 0}, {position: "7_2", hitCount: 0}],
                    laser: [{position: "1_0"}, {position: "1_9"}, {position: "3_9"}, {position: "13_7"}]
                },
                {
                    //level 3
                    won: false,
                    box: [{position: "2_4", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "9_7", hitCount: 0}, {position: "10_7", hitCount: 0}, {position: "7_2", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 4
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                }
            ]
};



function touchHandler(event) //needed for iPhone touch events
{
    var touches = event.changedTouches,
            first = touches[0],
            type = "";

    switch (event.type)
    {
        case "touchstart":
            type = "mousedown";
            break;
        case "touchmove":
            type = "mousemove";
            break;
        case "touchend":
            type = "mouseup";
            break;
        default:
            return;
    }

    //initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //           screenX, screenY, clientX, clientY, ctrlKey, 
    //           altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
            first.screenX, first.screenY,
            first.clientX, first.clientY, false,
            false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function init()
{
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
}

