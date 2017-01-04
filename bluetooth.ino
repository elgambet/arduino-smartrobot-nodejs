/*
  Bluetooth.ino - Make elegoo smart robot car v1.0 controlled by bluetooth
  Created by Pablo Gambetta December 2016
  Released into the public domain.
*/

// [esp] Incluir librerias necesarias para la conectividad y la conduccion del auto
// [eng] Include libraries necessary for the connectivity and driving of the car
#include <IRremote.h>
#include <Drivelib.h>
#include <Eyeslib.h>

// [esp] Incluir drivelib
// [eng] Include drivelib
Drivelib drivelib;
// [esp] Incluir eyeslib
// [eng] Include eyeslib
Eyeslib eyeslib;

int LED = 13;
volatile int state = LOW;
char getstr;

int distance = 0;
int rightDistance = 0;
int leftDistance = 0;
const int front = 0;
const int right = 1;
const int left = 2;
bool drive_front = false;

int mindistance_stop = 40;

void stateChange()
{
  state = !state;
  digitalWrite(LED, state);
}

void setup()
{
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  // [esp] Inicializar librerias
  // [eng] Initialize libraries
  drivelib.init();
  eyeslib.init();
  drivelib.stop(false);
}

void printDistanceSerial(int type, int distance)
{
  switch (type)
  {
  case front:
    Serial.print("_fi");
    Serial.print(distance);
    Serial.print("fe_");
    break;
  case right:
    Serial.print("_ri");
    Serial.print(distance);
    Serial.print("re_");
    break;
  case left:
    Serial.print("_li");
    Serial.print(distance);
    Serial.print("le_");
    break;
  }
  delay(100);
}

void get_right_distance()
{
  // Get right distance
  rightDistance = eyeslib.get_front_right_distance();
  printDistanceSerial(right, rightDistance);
}

void get_left_distance()
{
  // Get left distance
  leftDistance = eyeslib.get_front_left_distance();
  printDistanceSerial(right, leftDistance);
}

bool collide()
{
  // Get front distance
  distance = eyeslib.get_front_distance();
  if (distance <= mindistance_stop)
  {
    drivelib.stop(false);
    printDistanceSerial(front, distance);
    return true;
  }
  //printDistanceSerial(front, distance);
  return false;
}

void receive_command()
{
  getstr = Serial.read();
  if (getstr == 'f')
  {
    drive_front = true;
  }
  else if (getstr == 'b')
  {
    drive_front = false;
    drivelib.backward();
  }
  else if (getstr == 'l')
  {
    drive_front = false;
    drivelib.left(false);
  }
  else if (getstr == 'r')
  {
    drive_front = false;
    drivelib.right(false);
  }
  else if (getstr == 's')
  {
    drive_front = false;
    drivelib.stop(false);
  }
  else if (getstr == 'A')
  {
    stateChange();
  }
  else if (getstr == 'F')
  {
    drivelib.speed(255);
  }
  else if (getstr == 'N')
  {
    drivelib.speed(127);
  }
  else if (getstr == 'S')
  {
    drivelib.speed(80);
  }
  else if (getstr == 'L')
  {
    get_right_distance();
  }
  else if (getstr == 'R')
  {
    get_left_distance();
  }
  else if (getstr == '1')
  {
    mindistance_stop = 20;
  }
  else if (getstr == '2')
  {
    mindistance_stop = 40;
  }
  else if (getstr == '3')
  {
    mindistance_stop = 60;
  }
}

void loop()
{
  receive_command();
  if(drive_front && !collide()){
    drivelib.forward();
  } else if(drive_front){
    drivelib.stop(false);
    drive_front = false;
  }
}
