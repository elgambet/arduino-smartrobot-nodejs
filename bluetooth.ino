/*
  Bluetooth.ino - Make elegoo smart robot car v1.0 controlled by bluetooth
  Created by Pablo Gambetta December 2016
  Released into the public domain.
*/

// [esp] Incluir librerias necesarias para la conectividad y la conduccion del auto
// [eng] Include libraries necessary for the connectivity and driving of the car
#include <Drivelib.h>

// [esp] Incluir drivelib
// [eng] Include drivelib
Drivelib drivelib;

int LED=13;
volatile int state = LOW;
char getstr;

void stateChange()
{
  state = !state;
  digitalWrite(LED, state);  
}

void setup()
{ 
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  drivelib.stop(false);
}

void loop()
  { 
  getstr=Serial.read();
 if(getstr=='f')
  {
    drivelib.forward();
  }
  else if(getstr=='b')
  {
    drivelib.backward();
  }
  else if(getstr=='l')
  {
    drivelib.left(false);
  }
  else if(getstr=='r')
  {
    drivelib.right(false);
  }
  else if(getstr=='s')
  {
     drivelib.stop(false);     
  }
  else if(getstr=='A')
  {
    stateChange();
  }
  else if(getstr=='F')
  {
    drivelib.speed(255);
  }
  else if(getstr=='N')
  {
    drivelib.speed(127);
  }
  else if(getstr=='S')
  {
    drivelib.speed(80);
  }
}

