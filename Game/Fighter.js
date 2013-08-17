/*
    This file is part of Ironbane MMO.

    Ironbane MMO is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Ironbane MMO is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Ironbane MMO.  If not, see <http://www.gnu.org/licenses/>.
*/

var battleStatusTimeout = 10.0;

var Fighter = Actor.extend({
    attackTimeout: 1,
    init: function(data) {
        this._super(data);

        this.sendRotationPacketY = true;
        this.respawnTimer = 0.0;

        // NPC's don't really have an items array, but nevertheless...
        if (this.items === undefined) {
            this.items = [];
        }

        // Health and armor are the same values for their maximum, only for bots
        // Initially, their values come from MySQL and are afterwards updated within the server without updating MySQL
        // The template values are used for Maximum values, and should never be changed

        if ( this.id < 0 ) {
            this.healthMax = this.template.health;
            this.armorMax = this.template.armor;
        }
        else {
            this.calculateMaxHealth();
            this.calculateMaxArmor();
        }

        this.health = this.healthMax;
        this.armor = this.armorMax;

        this.chGodMode = false;
        this.chInvisibleByMonsters = false;
        this.ch999Damage = false;

        this.updateAppearance(false);

        this.healthRegenTimeout = 0.0;
        this.healthRegenInterval = 1.0;

        this.armorRegenTimeout = 0.0;
        this.armorRegenInterval = 1.0;

        this.lastBattleActionTimer = 0.0;

        if(this.getEquippedWeapon()) {
          this.attackTimeout = this.getEquippedWeapon().$template.delay;
        }
    },
    isInBattle: function() {
        return this.lastBattleActionTimer > 0;
    },
  shootProjectile: function(targetPosition, swingWeapon, weaponID, aimError) {

      aimError = !_.isUndefined(aimError) ? aimError : 0;

      // var offset = victim.velocity.clone().multiplyScalar(0.6);
      // var angle = getRandomFloat(0,getRandomFloat(0,1)) * Math.PI * 2;
      // offset.addSelf(new THREE.Vector3(Math.cos(angle)*aimError,
      //  0, Math.sin(angle)*aimError));

      var offset = new THREE.Vector3();
      // var angle = getRandomFloat(0,getRandomFloat(0,1)) * Math.PI * 2;
      // offset.addSelf(new THREE.Vector3(Math.cos(angle)*aimError,
      //  0, Math.sin(angle)*aimError));

      swingWeapon = !_.isUndefined(swingWeapon) ? swingWeapon : true;
      weaponID = weaponID || this.weapon.id;

      this.emitNearby("addProjectile", {
        s:this.position.clone().round(2),
        t:targetPosition.clone().addSelf(offset).round(2),
        o:this.id,
        w:weaponID,
        sw:swingWeapon
      });
  },
    attemptAttack: function(victim) {
        // log("attempt attack");
        this.handleMessage("attemptAttack", {});
        //if ( this.weapon.subtype == "bow" || this.weapon.subtype == "staff" ) {
        //if ( this.weapon.subtype == "bow" || this.weapon.subtype == "staff"  ) {
        // debugger;
        if (this.template.usebashattack) {
            this.attack(victim, this.weapon);
            // this.swingWeapon(victim.position);
        } else {
            //this.attack(this.enemy, this.weapon);
            this.shootProjectile(victim.position, true, 0, this.template.aimerror);
        }
    },
  attack: function(victim, weapon) {

    this.lastBattleActionTimer = battleStatusTimeout;




    // Do damage
    //        if ( this.id > 0 ) {
    //            var template = dataHandler.items[weapon.template];
    //
    //        }

    var damage = this.ch999Damage ? 999 : weapon.attr1;

    if ( !victim.chGodMode ) {

      if ( damage > 0 ) {

        // 22/12/12 No more PvP... :(
        if ( this.id > 0 && victim.id > 0 ) return;


        var remaining = damage - victim.armor;
        victim.armor -= damage;

        if ( remaining > 0 ) {
          victim.health -= remaining;
        }

        victim.health = Math.max(victim.health, 0);
        victim.armor = Math.max(victim.armor, 0);

        this.handleMessage("hurtTarget", {damage:damage});
      }
      else {
        victim.health += Math.abs(damage);

        victim.health = Math.min(victim.healthMax, victim.health);


        this.handleMessage("healTarget", {damage:damage});
      }
    }


    victim.handleMessage("attacked", {attacker:this});

    victim.emitNearby("getMeleeHit", {
      victim:victim.id,
      attacker:this.id,
      h:victim.health,
      a:victim.armor
    }, 0, victim.id > 0); // Only send to ourselves when we are a player (id > 0)


    // Only update the timer if we were attacked, not healed
    if ( damage > 0 ) {
      victim.lastBattleActionTimer = battleStatusTimeout;
    }

    if ( victim.health <= 0 && victim.respawnTimer <= 0) {
      //victim.health = 20;
      victim.health = 0;

      // Reset NPC velocities, as they would otherwise keep going and change cells
      if ( victim.id < 0 ) {
        victim.velocity.set(0,0,0);
      }

      victim.die(this);
      victim.respawnTimer = victim.id > 0 ? 10.0 : 30.0;


      // 22/12/12 Permadeath, no more respawning for players
      // if ( victim.id > 0 )  {

      //   victim.delete();



      // }

    }

  },
  tick: function(dTime) {
    if(this.attackTimeout > 0) {
      this.attackTimeout -= dTime;
    }

    if (this.lastBattleActionTimer > 0) {
      this.lastBattleActionTimer -= dTime;
    }

    if (this.health <= 0) {
      if (this.respawnTimer > 0.0) {
        this.respawnTimer -= dTime;
      } else {
        this.respawn();
      }
    } else {
      if (this.healthRegenTimeout > 0) {
        this.healthRegenTimeout -= dTime;
      }

      if (this.lastBattleActionTimer <= 0) {
        if (this.healthRegenTimeout <= 0) {
          this.healthRegenTimeout = this.healthRegenInterval;
          this.setHealth(this.health + 1);
        }
      }

      // Three seconds without being hit will recharge our armor
      if (this.armorRegenTimeout > 0) {
        this.armorRegenTimeout -= dTime;
      }
      if (this.lastBattleActionTimer <= battleStatusTimeout - 3) {
        if (this.armorRegenTimeout <= 0) {
          this.armorRegenTimeout = this.armorRegenInterval;
          this.setArmor(this.armor + 1);
        }
      }

      // No additional ticking needed for players (physics are done on the client)
      if (this.id > 0) {
        return;
      }

      this._super(dTime);
    }
  },
  setHealth: function(newHealth, noParticles) {
    var oldHealth = this.health;

    noParticles = noParticles || false;

    this.health = newHealth;

    this.health = Math.min(this.healthMax, this.health);


    if ( oldHealth != this.health ) {
      var data ={
        id:this.id,
        s:"h",
        h:this.health
        };
        if ( noParticles ) data.np = true;
      this.emitNearby("setStat", data, 0, true);
    }
  },
  setArmor: function(newArmor) {
    var oldArmor = this.armor;

    this.armor = newArmor;

    this.armor = Math.min(this.armorMax, this.armor);


    if ( oldArmor != this.armor ) {
      this.emitNearby("setStat", {
        id:this.id,
        s:"a",
        a:this.armor
        }, 0, true);
    }
  },
    die: function(killer) {
        if (this.id < 0) {
            //debugger;
            this.handleMessage("killed", {
                killer: killer
            });

            if (this.loot.length > 0) {
                var angle = getRandomFloat(0, 1) * Math.PI * 2;

                //log("spawning lootbag...");
                var bag = new Lootable({
                    id: server.getAValidNPCID(),
                    x: this.position.x + Math.cos(angle),
                    y: this.position.y,
                    z: this.position.z + Math.sin(angle),
                    zone: this.zone,

                    // Hacky: refers to lootBag ID
                    template: dataHandler.units[lootBagTemplate],

                    roty: 0
                }, false);

                for (var i = 0; i < this.loot.length; i++) {
                    var item = this.loot[i];

                    item.owner = bag.id;
                    // Add the item to the lootbag

                    // Make a copy of the item, so we don't remove the same item (reference)
                    // when we actually loot it as a player
                    // BS: ^^^ is this actually happening?
                    bag.loot.push(item);
                }
            }
        } else {
            // Remove their items
            this.items = [];

            chatHandler.died(this, killer);
        }
    },
    respawn: function() {
        this.setHealth(this.healthMax, true);
        this.setArmor(this.armorMax, true);

        if (this.id > 0) {
            //      this.position = new THREE.Vector3(0, 0, 0);
            //      this.zone = 1;
            //debugger;

            // People who die in the tutorial need to do it again
            if (this.zone === tutorialSpawnZone) {
                this.teleport(tutorialSpawnZone, tutorialSpawnPosition, true);
            } else {
                this.teleport(normalSpawnZone, normalSpawnPosition, true);
            }
        } else {
            if (this instanceof NPC) {
                this.setWeaponsAndLoot();
            }
            this.position = this.startPosition.clone();
            this.handleMessage("respawned", {});
        }

        // log("Respawned "+this.id);

        // Send the client that it's okay to revert back
        this.emitNearby("respawn", {
            id: this.id,
            p: this.position.clone().round(2),
            z: this.zone,
            h: this.health
        }, 0, true);

        if (this.id < 0) {
            this.velocity.set(0, 0, 0);
        }
    },
  // Returns true when the max health changed
  calculateMaxHealth: function(doEmit) {
    var oldHealthMax = this.healthMax;

    doEmit = doEmit || false;

    //        var healthMax = 20;

    //        for(var i in socketHandler.playerData.items) {
    //            var item = socketHandler.playerData.items[i];
    //
    //            var template = items[item.template];
    //
    //            if ( item.equipped ) {
    //
    //                if ( template.type == "armor" ) {
    //
    //                    healthMax += item.attr1;
    //
    //                }
    //            }
    //        }

    this.healthMax = 20;

    if ( doEmit && this.healthMax != oldHealthMax ) {
      this.emitNearby("setStat", {
        id:this.id,
        s:"hm",
        hm:this.healthMax
        }, 0, true);
    }

    if ( this.health > this.healthMax ) {
      this.setHealth(this.healthMax);
    }
  },
  // Returns true when the max armor changed
  calculateMaxArmor: function(doEmit) {


    doEmit = doEmit || false;

    var oldArmorMax = this.armorMax;

    var armorMax = 0;

    for(var i=0;i<this.items.length;i++) {
      var item = this.items[i];

      var template = dataHandler.items[item.template];

      if ( item.equipped ) {

        if ( template.type == "armor" ) {

          armorMax += item.attr1;

        }
      }
    }

    this.armorMax = armorMax;

    if ( doEmit && this.armorMax != oldArmorMax ) {
      this.emitNearby("setStat", {
        id:this.id,
        s:"am",
        am:this.armorMax
        }, 0, true);
    }

    if ( this.armor > this.armorMax ) {
      this.setArmor(this.armorMax);
    }
  },
    giveItem: function(template, config) {
        // todo: variable max inv?
        if (this.items.length >= 10) {
            // no free slots
            return false;
        }

        var taken = _.pluck(this.items, 'slot');
        // take first available slot
        var slot = _.difference(_.range(10), taken)[0];

        // config passed in goes to instance
        config = config || {};

        config.owner = this.id;
        config.slot = slot;

        // create new item based off the template
        var item = new Item(template, config);
        this.items.push(item);

        this.socket.emit("receiveItem", item);

        return true;
    },
    addCoins: function(amount) {
        // attempt to auto stack coins
        if(amount <= 0) {
            return false;
        }

        var bags = _.where(this.items, {type: 'cash'});
        if(bags.length > 0) {
            // for now just add to the first bag,
            // todo: bag limits?
            bags[0].value += amount;
        } else {
            // need to add one if the slot is available
            var template = _.where(dataHandler.items, {type: 'cash'})[0];
            if(!template) {
                log('server has no cash items!!!');
                return false;
            }

            if(!this.giveItem(template, {value: amount})) {
                // no room in inventory for coins!
                return false;
            }
        }

        return true;
    },
    updateAppearance: function(sendChanges) {
        this.head = 0;
        this.body = 0;
        this.feet = 0;

        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];

            if (item.equipped) {
                if (item.getType() === "armor") {
                    switch (item.getSubType()) {
                      case "head":
                          this.head = item.getImage();
                          break;
                      case "body":
                          this.body = item.getImage();
                          break;
                      case "feet":
                          this.feet = item.getImage();
                          break;
                    }
                }
            }
        }

        if (sendChanges) {
            this.emitNearby("updateClothes", {
                id: this.id,
                head: this.head,
                body: this.body,
                feet: this.feet
            });
        }
    },
    getEquippedWeapon: function() {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];

            if (item.equipped && (item.getType() === "weapon" || item.getType() === "tool")) {
                return item;
            }
        }

        return null;
    },
    getTotalCoins: function() {
        // sum value of cash items in inventory
        return _.reduce(_.pluck(_.where(this.items, {
            type: 'cash'
        }), 'value'), function(memo, num) {
            return memo + num;
        }, 0);
    },
    purchase: function(item) {
        // if player has multiple money bags need to remove them until finished
        var bags = _.where(this.items, {type: 'cash'}),
            bagIndex = 0,
            available = this.getTotalCoins(),
            remaining = item.price;

        if(!remaining || remaining <= 0) {
            return false; // invalid price! (fallback to value or basevalue?)
        }

        if(available < remaining) {
            return false; // can't afford
        }

        while(remaining > 0) {
            if(bags[bagIndex].value - remaining < 0) {
                remaining -= bags[bagIndex].value;
                this.items = _.without(this.items, bags[bagIndex]);
            } else {
                bags[bagIndex].value -= remaining;
                remaining = 0;
            }

            bagIndex++;
        }

        // purchase successful
        return true;
    },
  inLineOfSight: function(unit, noHeadingCheck) {
    var unitToUs = unit.position.clone().subSelf(this.position);

    noHeadingCheck = noHeadingCheck || false;

    if ( !noHeadingCheck && this.heading.dot(unitToUs.normalize()) <= 0 ) {
      // log("not in the FOV!");
      return false;
    }

    if ( unit.id > 0 ) {
      // Check the LOS array
      if ( !_.contains(unit.unitsInLineOfSight, this.id) ) {
        // log("not found in los list!");
        return false;
      }
    }

    // log("in LOS! LOS:");
    // console.log(unit.unitsInLineOfSight);
    return true;
  },
  findNearestTarget: function(maxDistance, onlyPlayers, noHeadingCheck) {
    maxDistance = maxDistance || 0;
    onlyPlayers = onlyPlayers || false;

    var cx = this.cellX;
    var cz = this.cellZ;

    //log("FindNearestTarget, maxDistance "+maxDistance+", onlyPlayers "+(onlyPlayers?"true":"false")+"");

    for(var x=cx-1;x<=cx+1;x++){
      for(var z=cz-1;z<=cz+1;z++){
        if ( worldHandler.checkWorldStructure(this.zone, x, z) ) {
          for(var u=0;u<worldHandler.world[this.zone][x][z].units.length;u++) {
            var unit = worldHandler.world[this.zone][x][z].units[u];

            if ( unit == this ) {
              continue;
            }

            if ( unit instanceof Fighter ) {

              //debugger;

              if ( unit.health <= 0 ) {
                //log("unit.health <= 0");
                continue;
              }

              if ( unit.chInvisibleByMonsters ) {
                //log("unit.chInvisibleByMonsters");
                continue;
              }

              if ( onlyPlayers && unit.id < 0 ) {
                //log("onlyPlayers && unit.id < 0");
                continue;
              }

              // Check if we are looking at the target
              if ( !this.inLineOfSight(unit, noHeadingCheck) ) {
                //log("not in line of sight!");
                continue;
              }


            }
            else {
              continue;
            }

            if ( maxDistance > 0 && !this.inRangeOfUnit(unit, maxDistance) ) {
              //log("too far away!");
              continue;
            }

            //if ( maxDistance > 0 && !unit.inRangeOfPosition(this.startPosition, maxDistance) ) continue;


            return unit;

          }
        }
      }
    }
    return null;
  }
});
