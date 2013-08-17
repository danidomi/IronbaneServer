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



 
var MovingObstacle = DynamicMesh.extend({
    init: function(position, rotation, id, param, metadata) {	
                
        

        this._super(position, rotation, id, param, metadata);


        
        
    },  
    tick: function(dTime) {
                       
        if ( this.mesh ) {
            
            var time = (new Date()).getTime();
                      

            switch (this.movementType) {
                case MovingObstacleMovementTypeEnum.sineWaveX:
                    this.localPosition.x = this.startPosition.x + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    break;
                case MovingObstacleMovementTypeEnum.sineWaveY:
                    this.localPosition.y = this.startPosition.y + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    break;         
                case MovingObstacleMovementTypeEnum.sineWaveZ:
                    this.localPosition.z = this.startPosition.z + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    break;            
                case MovingObstacleMovementTypeEnum.sineWaveXY:
                    this.localPosition.x = this.startPosition.x + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    this.localPosition.y = this.startPosition.y + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    break;   
                case MovingObstacleMovementTypeEnum.sineWaveXZ:
                    this.localPosition.x = this.startPosition.x + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    this.localPosition.z = this.startPosition.z + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    break;   
                case MovingObstacleMovementTypeEnum.sineWaveYZ:
                    this.localPosition.y = this.startPosition.y + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    this.localPosition.z = this.startPosition.z + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    break;    
                case MovingObstacleMovementTypeEnum.sineWaveXYZ:
                    this.localPosition.x = this.startPosition.x + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    this.localPosition.y = this.startPosition.y + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    this.localPosition.z = this.startPosition.z + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    break;        
                case MovingObstacleMovementTypeEnum.sineWaveXYZ2:
                    this.localPosition.x = this.startPosition.x + (Math.sin((time/1000.0)*this.speedMultiplier*0.9)*this.distanceMultiplier);
                    this.localPosition.y = this.startPosition.y + (Math.sin((time/1000.0)*this.speedMultiplier)*this.distanceMultiplier);
                    this.localPosition.z = this.startPosition.z + (Math.sin((time/1000.0)*this.speedMultiplier*1.1)*this.distanceMultiplier);
                    break;
                case MovingObstacleMovementTypeEnum.rotationX:
                    this.changeRotation = true;
                    this.rotation.x = ((time/100.0)*this.speedMultiplier)%360;
                    break;                    
                case MovingObstacleMovementTypeEnum.rotationY:
                    this.changeRotation = true;
                    this.rotation.y = ((time/100.0)*this.speedMultiplier)%360;
                    break;                        
                case MovingObstacleMovementTypeEnum.rotationZ:
                    this.changeRotation = true;
                    this.rotation.z = ((time/100.0)*this.speedMultiplier)%360;
                    break;    
                case MovingObstacleMovementTypeEnum.rotationXY:
                    this.changeRotation = true;
                    this.rotation.x = ((time/100.0)*this.speedMultiplier)%360;
                    this.rotation.y = ((time/100.0)*this.speedMultiplier)%360;
                    break;   
                case MovingObstacleMovementTypeEnum.rotationXZ:
                    this.changeRotation = true;
                    this.rotation.x = ((time/100.0)*this.speedMultiplier)%360;
                    this.rotation.z = ((time/100.0)*this.speedMultiplier)%360;
                    break;   
                case MovingObstacleMovementTypeEnum.rotationYZ:
                    this.changeRotation = true;
                    this.rotation.y = ((time/100.0)*this.speedMultiplier)%360;
                    this.rotation.z = ((time/100.0)*this.speedMultiplier)%360;
                    break;          
                case MovingObstacleMovementTypeEnum.rotationXYZ:
                    this.changeRotation = true;
                    this.rotation.x = ((time/100.0)*this.speedMultiplier)%360;
                    this.rotation.y = ((time/100.0)*this.speedMultiplier)%360;
                    this.rotation.z = ((time/100.0)*this.speedMultiplier)%360;
                    break;  
                case MovingObstacleMovementTypeEnum.rotationXYZ2:
                    this.changeRotation = true;
                    this.rotation.x = ((time/100.0)*this.speedMultiplier*0.9)%360;
                    this.rotation.y = ((time/100.0)*this.speedMultiplier)%360;
                    this.rotation.z = ((time/100.0)*this.speedMultiplier*1.1)%360;
                    break;                    
                default:
                    this.changeRotation = true;
                    this.position.lerpSelf(this.targetPosition, dTime*2);        
                    this.rotation.lerpSelf(this.targetRotation, dTime*20);
                    break;
            }         

// this.localPosition.y = 1;
//
//                    this.changeRotation = true;
//                    this.rotation.x = 180;
//                    //this.rotation.y = 0;
//                    this.rotation.z = 0;

        }
        
        this._super(dTime);
        
        //this.updateRotation();
        
    }
});


