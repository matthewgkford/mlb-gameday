import React, { useState, useEffect } from 'react';
import { TeamLogo, PlayerPhoto, TrendArrow, rateERA, rateWHIP } from './SharedUI';
import PlayerPage from './PlayerPage';

// Real 2025 pitch usage data from Baseball Savant
// Source: baseballsavant.mlb.com pitch arsenal stats export
// Note: Only pitches above the usage threshold are included per pitcher
// Percentages show actual usage rate for that pitch type
const PITCH_ARSENALS = {
  'Aaron Ashby': [{name:'Sinker',pct:51.3,type:'SI'}],
  'Aaron Civale': [{name:'Cutter',pct:35.0,type:'FC'}],
  'Aaron Nola': [{name:'4-Seam Fastball',pct:30.3,type:'FF'},{name:'Curveball',pct:29.1,type:'CU'}],
  'Abner Uribe': [{name:'Sinker',pct:51.8,type:'SI'},{name:'Slider',pct:46.0,type:'SL'}],
  'Adrian Houser': [{name:'Sinker',pct:45.9,type:'SI'}],
  'Adrian Morejon': [{name:'Sinker',pct:61.8,type:'SI'}],
  'Alex Vesia': [{name:'4-Seam Fastball',pct:57.5,type:'FF'}],
  'Andre Pallante': [{name:'4-Seam Fastball',pct:44.1,type:'FF'},{name:'Slider',pct:28.5,type:'SL'}],
  'Andrew Abbott': [{name:'4-Seam Fastball',pct:47.2,type:'FF'},{name:'Changeup',pct:19.6,type:'CH'}],
  'Andrew Heaney': [{name:'4-Seam Fastball',pct:43.7,type:'FF'}],
  'Andrew Kittredge': [{name:'Slider',pct:52.9,type:'SL'}],
  'Andrés Muñoz': [{name:'Slider',pct:50.4,type:'SL'}],
  'Angel Zerpa': [{name:'Sinker',pct:43.9,type:'SI'}],
  'Anthony Banda': [{name:'Slider',pct:49.2,type:'SL'}],
  'Antonio Senzatela': [{name:'4-Seam Fastball',pct:56.9,type:'FF'},{name:'Slider',pct:18.0,type:'SL'}],
  'Bailey Falter': [{name:'4-Seam Fastball',pct:50.8,type:'FF'}],
  'Bailey Ober': [{name:'4-Seam Fastball',pct:35.9,type:'FF'},{name:'Changeup',pct:28.9,type:'CH'},{name:'Slider',pct:17.7,type:'SL'}],
  'Ben Brown': [{name:'4-Seam Fastball',pct:55.6,type:'FF'},{name:'Curveball',pct:39.9,type:'CU'}],
  'Blake Snell': [{name:'4-Seam Fastball',pct:43.6,type:'FF'}],
  'Brady Singer': [{name:'Sinker',pct:40.6,type:'SI'},{name:'Slider',pct:28.4,type:'SL'}],
  'Brandon Pfaadt': [{name:'Sinker',pct:23.5,type:'SI'},{name:'4-Seam Fastball',pct:23.4,type:'FF'},{name:'Sweeper',pct:18.6,type:'ST'},{name:'Changeup',pct:15.7,type:'CH'}],
  'Brayan Bello': [{name:'Sinker',pct:35.0,type:'SI'},{name:'Sweeper',pct:19.0,type:'ST'},{name:'Cutter',pct:15.7,type:'FC'},{name:'Changeup',pct:15.2,type:'CH'},{name:'4-Seam Fastball',pct:15.1,type:'FF'}],
  'Bryce Elder': [{name:'Sinker',pct:42.1,type:'SI'},{name:'Slider',pct:35.1,type:'SL'}],
  'Bryce Miller': [{name:'4-Seam Fastball',pct:40.9,type:'FF'}],
  'Bryan Abreu': [{name:'4-Seam Fastball',pct:50.0,type:'FF'},{name:'Slider',pct:48.4,type:'SL'}],
  'Bryan Woo': [{name:'4-Seam Fastball',pct:47.3,type:'FF'},{name:'Sinker',pct:25.5,type:'SI'}],
  'Cal Quantrill': [{name:'Sinker',pct:22.1,type:'SI'},{name:'Cutter',pct:21.7,type:'FC'},{name:'Split-Finger',pct:21.1,type:'FS'}],
  'Camilo Doval': [{name:'Slider',pct:48.0,type:'SL'},{name:'Cutter',pct:39.8,type:'FC'}],
  'Carlos Rodón': [{name:'4-Seam Fastball',pct:41.8,type:'FF'},{name:'Slider',pct:28.4,type:'SL'},{name:'Changeup',pct:16.2,type:'CH'}],
  'Casey Mize': [{name:'4-Seam Fastball',pct:33.6,type:'FF'},{name:'Split-Finger',pct:24.2,type:'FS'}],
  'Chad Patrick': [{name:'Cutter',pct:41.2,type:'FC'},{name:'Sinker',pct:23.0,type:'SI'},{name:'4-Seam Fastball',pct:22.2,type:'FF'}],
  'Charlie Morton': [{name:'Curveball',pct:38.3,type:'CU'},{name:'4-Seam Fastball',pct:27.6,type:'FF'}],
  'Chase Burns': [{name:'4-Seam Fastball',pct:57.9,type:'FF'}],
  'Chris Bassitt': [{name:'Sinker',pct:41.7,type:'SI'},{name:'Cutter',pct:16.8,type:'FC'},{name:'Curveball',pct:16.2,type:'CU'}],
  'Chris Paddack': [{name:'4-Seam Fastball',pct:43.2,type:'FF'},{name:'Changeup',pct:23.5,type:'CH'}],
  'Chris Sale': [{name:'Slider',pct:47.3,type:'SL'},{name:'4-Seam Fastball',pct:41.7,type:'FF'}],
  'Clarke Schmidt': [{name:'Cutter',pct:40.9,type:'FC'}],
  'Clay Holmes': [{name:'Sinker',pct:40.8,type:'SI'},{name:'Sweeper',pct:19.0,type:'ST'},{name:'Changeup',pct:15.7,type:'CH'}],
  'Clayton Kershaw': [{name:'Slider',pct:41.4,type:'SL'},{name:'4-Seam Fastball',pct:34.6,type:'FF'}],
  'Cole Ragans': [{name:'4-Seam Fastball',pct:49.5,type:'FF'}],
  'Colin Rea': [{name:'4-Seam Fastball',pct:41.5,type:'FF'}],
  'Colton Gordon': [{name:'4-Seam Fastball',pct:41.0,type:'FF'},{name:'Sweeper',pct:28.0,type:'ST'}],
  'Corbin Burnes': [{name:'Cutter',pct:55.0,type:'FC'}],
  'Cristopher Sánchez': [{name:'Sinker',pct:46.0,type:'SI'},{name:'Changeup',pct:37.4,type:'CH'},{name:'Slider',pct:16.6,type:'SL'}],
  'David Peterson': [{name:'Sinker',pct:29.6,type:'SI'},{name:'4-Seam Fastball',pct:22.3,type:'FF'},{name:'Slider',pct:19.1,type:'SL'},{name:'Changeup',pct:15.3,type:'CH'}],
  'Davis Martin': [{name:'4-Seam Fastball',pct:32.7,type:'FF'},{name:'Changeup',pct:24.4,type:'CH'},{name:'Slider',pct:21.5,type:'SL'}],
  'Dean Kremer': [{name:'4-Seam Fastball',pct:26.6,type:'FF'},{name:'Split-Finger',pct:21.1,type:'FS'},{name:'Cutter',pct:20.2,type:'FC'},{name:'Sinker',pct:19.3,type:'SI'}],
  'Devin Williams': [{name:'Changeup',pct:52.4,type:'CH'},{name:'4-Seam Fastball',pct:47.4,type:'FF'}],
  'Drew Rasmussen': [{name:'4-Seam Fastball',pct:35.2,type:'FF'},{name:'Cutter',pct:31.4,type:'FC'},{name:'Sinker',pct:22.9,type:'SI'}],
  'Dustin May': [{name:'Sweeper',pct:39.3,type:'ST'},{name:'Sinker',pct:33.6,type:'SI'}],
  'Dylan Cease': [{name:'4-Seam Fastball',pct:42.1,type:'FF'},{name:'Slider',pct:40.8,type:'SL'}],
  'Eduardo Rodriguez': [{name:'4-Seam Fastball',pct:46.6,type:'FF'},{name:'Changeup',pct:20.5,type:'CH'}],
  'Edward Cabrera': [{name:'Changeup',pct:25.8,type:'CH'},{name:'Curveball',pct:23.6,type:'CU'},{name:'Sinker',pct:20.4,type:'SI'}],
  'Edwin Díaz': [{name:'4-Seam Fastball',pct:52.6,type:'FF'},{name:'Slider',pct:47.3,type:'SL'}],
  'Emmanuel Clase': [{name:'Cutter',pct:68.9,type:'FC'}],
  'Erick Fedde': [{name:'Sinker',pct:33.3,type:'SI'},{name:'Cutter',pct:28.0,type:'FC'},{name:'Sweeper',pct:26.0,type:'ST'}],
  'Framber Valdez': [{name:'Sinker',pct:45.7,type:'SI'},{name:'Curveball',pct:33.1,type:'CU'},{name:'Changeup',pct:17.9,type:'CH'}],
  'Freddy Peralta': [{name:'4-Seam Fastball',pct:53.5,type:'FF'},{name:'Changeup',pct:21.2,type:'CH'},{name:'Curveball',pct:15.1,type:'CU'}],
  'Garrett Crochet': [{name:'4-Seam Fastball',pct:35.9,type:'FF'},{name:'Cutter',pct:27.7,type:'FC'},{name:'Sweeper',pct:16.0,type:'ST'},{name:'Sinker',pct:16.0,type:'SI'}],
  'Gavin Williams': [{name:'4-Seam Fastball',pct:37.4,type:'FF'},{name:'Curveball',pct:22.0,type:'CU'},{name:'Sweeper',pct:19.9,type:'ST'},{name:'Cutter',pct:14.0,type:'FC'}],
  'George Kirby': [{name:'4-Seam Fastball',pct:28.8,type:'FF'},{name:'Slider',pct:28.2,type:'SL'},{name:'Sinker',pct:26.8,type:'SI'}],
  'Graham Ashcraft': [{name:'Cutter',pct:54.1,type:'FC'},{name:'Slider',pct:45.9,type:'SL'}],
  'Griffin Canning': [{name:'4-Seam Fastball',pct:35.1,type:'FF'},{name:'Slider',pct:30.6,type:'SL'}],
  'Hunter Brown': [{name:'4-Seam Fastball',pct:37.5,type:'FF'},{name:'Sinker',pct:22.7,type:'SI'},{name:'Curveball',pct:17.9,type:'CU'}],
  'Hunter Greene': [{name:'4-Seam Fastball',pct:54.2,type:'FF'},{name:'Slider',pct:35.0,type:'SL'}],
  'J.T. Ginn': [{name:'Sinker',pct:51.4,type:'SI'},{name:'Slider',pct:25.8,type:'SL'}],
  'JP Sears': [{name:'4-Seam Fastball',pct:40.1,type:'FF'},{name:'Sweeper',pct:27.0,type:'ST'}],
  'Jack Flaherty': [{name:'4-Seam Fastball',pct:46.9,type:'FF'},{name:'Curveball',pct:25.4,type:'CU'},{name:'Slider',pct:23.6,type:'SL'}],
  'Jack Leiter': [{name:'4-Seam Fastball',pct:38.8,type:'FF'},{name:'Slider',pct:23.3,type:'SL'},{name:'Changeup',pct:16.5,type:'CH'}],
  'Jacob deGrom': [{name:'4-Seam Fastball',pct:46.0,type:'FF'},{name:'Slider',pct:37.6,type:'SL'}],
  'Jake Irvin': [{name:'4-Seam Fastball',pct:32.0,type:'FF'},{name:'Curveball',pct:29.6,type:'CU'},{name:'Sinker',pct:22.2,type:'SI'}],
  'Jameson Taillon': [{name:'4-Seam Fastball',pct:37.9,type:'FF'}],
  'Jason Alexander': [{name:'Sinker',pct:39.9,type:'SI'},{name:'Changeup',pct:32.7,type:'CH'}],
  'Jeffrey Springs': [{name:'4-Seam Fastball',pct:42.5,type:'FF'},{name:'Changeup',pct:25.3,type:'CH'},{name:'Slider',pct:20.2,type:'SL'}],
  'Jesús Luzardo': [{name:'4-Seam Fastball',pct:33.3,type:'FF'},{name:'Sweeper',pct:31.0,type:'ST'},{name:'Changeup',pct:17.3,type:'CH'}],
  'Joe Ryan': [{name:'4-Seam Fastball',pct:50.3,type:'FF'}],
  'Joey Cantillo': [{name:'4-Seam Fastball',pct:42.0,type:'FF'},{name:'Changeup',pct:30.5,type:'CH'}],
  'Jose Quintana': [{name:'Sinker',pct:43.8,type:'SI'},{name:'Changeup',pct:22.2,type:'CH'}],
  'José Berríos': [{name:'Sinker',pct:33.6,type:'SI'},{name:'Slurve',pct:25.9,type:'SV'},{name:'4-Seam Fastball',pct:17.9,type:'FF'},{name:'Changeup',pct:16.8,type:'CH'}],
  'José Soriano': [{name:'Sinker',pct:49.1,type:'SI'},{name:'Curveball',pct:26.7,type:'CU'}],
  'Justin Verlander': [{name:'4-Seam Fastball',pct:45.3,type:'FF'},{name:'Slider',pct:23.3,type:'SL'}],
  'Kevin Gausman': [{name:'4-Seam Fastball',pct:53.7,type:'FF'},{name:'Split-Finger',pct:37.4,type:'FS'}],
  'Kodai Senga': [{name:'4-Seam Fastball',pct:31.4,type:'FF'},{name:'Split-Finger',pct:28.5,type:'FS'}],
  'Kyle Freeland': [{name:'4-Seam Fastball',pct:33.4,type:'FF'},{name:'Curveball',pct:26.1,type:'CU'}],
  'Kyle Hendricks': [{name:'Changeup',pct:38.4,type:'CH'},{name:'Sinker',pct:38.4,type:'SI'}],
  'Landen Roupp': [{name:'Sinker',pct:39.9,type:'SI'},{name:'Curveball',pct:35.7,type:'CU'}],
  'Logan Allen': [{name:'4-Seam Fastball',pct:33.2,type:'FF'},{name:'Sweeper',pct:23.5,type:'ST'},{name:'Changeup',pct:18.3,type:'CH'}],
  'Logan Gilbert': [{name:'4-Seam Fastball',pct:36.7,type:'FF'},{name:'Slider',pct:35.3,type:'SL'},{name:'Split-Finger',pct:19.6,type:'FS'}],
  'Logan Webb': [{name:'Sinker',pct:33.6,type:'SI'},{name:'Sweeper',pct:26.6,type:'ST'},{name:'Changeup',pct:24.1,type:'CH'}],
  'Lucas Giolito': [{name:'4-Seam Fastball',pct:48.4,type:'FF'},{name:'Slider',pct:25.6,type:'SL'},{name:'Changeup',pct:22.6,type:'CH'}],
  'Luis Castillo': [{name:'4-Seam Fastball',pct:46.3,type:'FF'},{name:'Sinker',pct:22.0,type:'SI'},{name:'Slider',pct:20.4,type:'SL'}],
  'Luis Gil': [{name:'4-Seam Fastball',pct:50.6,type:'FF'}],
  'Luis Severino': [{name:'4-Seam Fastball',pct:28.0,type:'FF'},{name:'Sweeper',pct:24.8,type:'ST'},{name:'Sinker',pct:20.2,type:'SI'},{name:'Cutter',pct:17.6,type:'FC'}],
  'MacKenzie Gore': [{name:'4-Seam Fastball',pct:49.3,type:'FF'},{name:'Curveball',pct:24.0,type:'CU'}],
  'Marcus Stroman': [{name:'Sinker',pct:45.5,type:'SI'}],
  'Mason Miller': [{name:'4-Seam Fastball',pct:52.2,type:'FF'},{name:'Slider',pct:45.6,type:'SL'}],
  'Matthew Boyd': [{name:'4-Seam Fastball',pct:47.1,type:'FF'},{name:'Changeup',pct:23.7,type:'CH'},{name:'Slider',pct:14.9,type:'SL'}],
  'Max Fried': [{name:'Cutter',pct:28.6,type:'FC'},{name:'Sinker',pct:17.7,type:'SI'},{name:'Curveball',pct:17.3,type:'CU'}],
  'Merrill Kelly': [{name:'Changeup',pct:27.1,type:'CH'},{name:'4-Seam Fastball',pct:23.2,type:'FF'},{name:'Cutter',pct:20.2,type:'FC'}],
  'Michael Lorenzen': [{name:'4-Seam Fastball',pct:22.0,type:'FF'},{name:'Sinker',pct:18.0,type:'SI'}],
  'Michael Wacha': [{name:'4-Seam Fastball',pct:27.0,type:'FF'},{name:'Changeup',pct:25.4,type:'CH'}],
  'Miles Mikolas': [{name:'4-Seam Fastball',pct:27.7,type:'FF'},{name:'Slider',pct:23.4,type:'SL'},{name:'Curveball',pct:17.6,type:'CU'},{name:'Sinker',pct:17.0,type:'SI'}],
  'Mitchell Parker': [{name:'4-Seam Fastball',pct:55.5,type:'FF'},{name:'Curveball',pct:22.0,type:'CU'}],
  'Mitch Keller': [{name:'4-Seam Fastball',pct:34.8,type:'FF'},{name:'Sweeper',pct:19.1,type:'ST'},{name:'Sinker',pct:17.8,type:'SI'}],
  'Nathan Eovaldi': [{name:'Split-Finger',pct:31.4,type:'FS'},{name:'4-Seam Fastball',pct:22.5,type:'FF'}],
  'Nick Lodolo': [{name:'Curveball',pct:28.7,type:'CU'},{name:'4-Seam Fastball',pct:27.8,type:'FF'},{name:'Sinker',pct:21.8,type:'SI'},{name:'Changeup',pct:21.7,type:'CH'}],
  'Nick Pivetta': [{name:'4-Seam Fastball',pct:47.4,type:'FF'},{name:'Curveball',pct:22.4,type:'CU'},{name:'Sweeper',pct:18.6,type:'ST'}],
  'Pablo López': [{name:'4-Seam Fastball',pct:41.2,type:'FF'}],
  'Patrick Corbin': [{name:'Slider',pct:33.5,type:'SL'},{name:'Sinker',pct:28.9,type:'SI'},{name:'Cutter',pct:25.0,type:'FC'}],
  'Paul Skenes': [{name:'4-Seam Fastball',pct:38.9,type:'FF'},{name:'Sweeper',pct:15.8,type:'ST'},{name:'Split-Finger',pct:13.5,type:'FS'}],
  'Quinn Priester': [{name:'Sinker',pct:41.7,type:'SI'},{name:'Slider',pct:26.9,type:'SL'},{name:'Cutter',pct:20.6,type:'FC'}],
  'Rafael Montero': [{name:'Split-Finger',pct:47.0,type:'FS'},{name:'4-Seam Fastball',pct:40.6,type:'FF'}],
  'Ranger Suarez': [{name:'Sinker',pct:28.6,type:'SI'},{name:'Changeup',pct:19.1,type:'CH'},{name:'Cutter',pct:17.6,type:'FC'}],
  'Reid Detmers': [{name:'4-Seam Fastball',pct:45.4,type:'FF'}],
  'Robbie Ray': [{name:'4-Seam Fastball',pct:51.9,type:'FF'},{name:'Slider',pct:22.6,type:'SL'}],
  'Ronel Blanco': [{name:'4-Seam Fastball',pct:37.5,type:'FF'}],
  'Ryan Helsley': [{name:'Slider',pct:47.4,type:'SL'},{name:'4-Seam Fastball',pct:45.5,type:'FF'}],
  'Ryan Pepiot': [{name:'4-Seam Fastball',pct:45.0,type:'FF'},{name:'Changeup',pct:25.1,type:'CH'},{name:'Slider',pct:17.8,type:'SL'}],
  'Ryne Nelson': [{name:'4-Seam Fastball',pct:61.9,type:'FF'}],
  'Sandy Alcantara': [{name:'Sinker',pct:25.8,type:'SI'},{name:'Changeup',pct:23.2,type:'CH'},{name:'4-Seam Fastball',pct:17.1,type:'FF'},{name:'Slider',pct:17.1,type:'SL'},{name:'Cutter',pct:16.7,type:'FC'}],
  'Sean Burke': [{name:'4-Seam Fastball',pct:43.1,type:'FF'},{name:'Curveball',pct:23.7,type:'CU'},{name:'Slider',pct:21.9,type:'SL'}],
  'Sean Manaea': [{name:'4-Seam Fastball',pct:60.5,type:'FF'}],
  'Seth Lugo': [{name:'Curveball',pct:23.0,type:'CU'},{name:'4-Seam Fastball',pct:21.1,type:'FF'}],
  'Shane Baz': [{name:'4-Seam Fastball',pct:43.9,type:'FF'},{name:'Curveball',pct:26.9,type:'CU'}],
  'Shota Imanaga': [{name:'4-Seam Fastball',pct:48.7,type:'FF'},{name:'Split-Finger',pct:31.4,type:'FS'}],
  'Simeon Woods Richardson': [{name:'4-Seam Fastball',pct:45.6,type:'FF'},{name:'Slider',pct:27.2,type:'SL'}],
  'Sonny Gray': [{name:'4-Seam Fastball',pct:21.7,type:'FF'},{name:'Sweeper',pct:19.2,type:'ST'},{name:'Curveball',pct:18.4,type:'CU'},{name:'Sinker',pct:18.0,type:'SI'}],
  'Spencer Strider': [{name:'4-Seam Fastball',pct:51.2,type:'FF'},{name:'Slider',pct:35.3,type:'SL'}],
  'Steven Matz': [{name:'Sinker',pct:58.4,type:'SI'}],
  'Taijuan Walker': [{name:'Cutter',pct:30.1,type:'FC'},{name:'Split-Finger',pct:22.5,type:'FS'},{name:'Sinker',pct:20.2,type:'SI'}],
  'Taj Bradley': [{name:'4-Seam Fastball',pct:38.6,type:'FF'},{name:'Cutter',pct:22.6,type:'FC'}],
  'Tanner Bibee': [{name:'4-Seam Fastball',pct:27.9,type:'FF'},{name:'Cutter',pct:20.7,type:'FC'},{name:'Sweeper',pct:16.0,type:'ST'},{name:'Sinker',pct:15.2,type:'SI'},{name:'Changeup',pct:15.2,type:'CH'}],
  'Tanner Scott': [{name:'4-Seam Fastball',pct:52.6,type:'FF'},{name:'Slider',pct:47.2,type:'SL'}],
  'Tarik Skubal': [{name:'Changeup',pct:31.4,type:'CH'},{name:'4-Seam Fastball',pct:29.3,type:'FF'},{name:'Sinker',pct:23.9,type:'SI'}],
  'Taylor Rogers': [{name:'Sweeper',pct:50.9,type:'ST'},{name:'Sinker',pct:49.1,type:'SI'}],
  'Trevor Rogers': [{name:'4-Seam Fastball',pct:40.9,type:'FF'},{name:'Changeup',pct:25.0,type:'CH'}],
  'Trevor Williams': [{name:'4-Seam Fastball',pct:42.3,type:'FF'}],
  'Tyler Anderson': [{name:'4-Seam Fastball',pct:38.1,type:'FF'},{name:'Changeup',pct:34.0,type:'CH'},{name:'Cutter',pct:20.5,type:'FC'}],
  'Tyler Glasnow': [{name:'4-Seam Fastball',pct:36.3,type:'FF'}],
  'Tyler Mahle': [{name:'4-Seam Fastball',pct:49.7,type:'FF'}],
  'Tylor Megill': [{name:'4-Seam Fastball',pct:42.3,type:'FF'}],
  'Will Warren': [{name:'4-Seam Fastball',pct:41.6,type:'FF'},{name:'Sinker',pct:21.0,type:'SI'},{name:'Sweeper',pct:20.6,type:'ST'}],
  'Yariel Rodríguez': [{name:'Slider',pct:41.3,type:'SL'},{name:'4-Seam Fastball',pct:40.8,type:'FF'}],
  'Yoshinobu Yamamoto': [{name:'4-Seam Fastball',pct:35.2,type:'FF'},{name:'Split-Finger',pct:25.5,type:'FS'},{name:'Curveball',pct:17.6,type:'CU'}],
  'Yu Darvish': [{name:'Slider',pct:28.1,type:'SL'},{name:'Cutter',pct:25.5,type:'FC'},{name:'Split-Finger',pct:19.9,type:'FS'},{name:'Sinker',pct:14.3,type:'SI'}],
  'Yusei Kikuchi': [{name:'Slider',pct:36.2,type:'SL'},{name:'4-Seam Fastball',pct:34.9,type:'FF'},{name:'Curveball',pct:15.4,type:'CU'}],
  'Zac Gallen': [{name:'4-Seam Fastball',pct:45.0,type:'FF'},{name:'Curveball',pct:23.5,type:'CU'},{name:'Changeup',pct:16.0,type:'CH'}],
  'Zack Littell': [{name:'Slider',pct:27.5,type:'SL'},{name:'Split-Finger',pct:27.3,type:'FS'},{name:'4-Seam Fastball',pct:23.9,type:'FF'},{name:'Sinker',pct:15.8,type:'SI'}],
  'Zack Wheeler': [{name:'4-Seam Fastball',pct:40.9,type:'FF'},{name:'Sinker',pct:17.1,type:'SI'}],
};

const PITCH_COLORS = {
  FF:'#3B82F6', SI:'#F472B6', FC:'#FB923C',
  SL:'#06D6A0', ST:'#A78BFA', CH:'#FACC15',
  CU:'#60a5fa', KC:'#60a5fa', FS:'#4ade80',
  KN:'#e2e8f0', SV:'#c084fc', FA:'#3B82F6',
};

function PitchBars({ pitches }) {
  if (!pitches?.length) return null;
  return (
    <div style={{ marginTop:12, paddingTop:12, borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>
        Pitch usage · 2025 season · Baseball Savant
      </div>
      {pitches.map(p => {
        const color = PITCH_COLORS[p.type] || '#94a3b8';
        return (
          <div key={p.name} style={{ marginBottom:7 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>{p.name}</span>
              <span style={{ fontSize:12, fontWeight:600, color, minWidth:42, textAlign:'right' }}>{p.pct}%</span>
            </div>
            <div style={{ height:5, background:'rgba(255,255,255,0.08)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${p.pct}%`, background:color, borderRadius:3, transition:'width 0.6s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PitcherCard({ pitcher, isWinner, isLoser, isFinal }) {
  const arsenal = PITCH_ARSENALS[pitcher.name] || null;
  const roleLabel = pitcher.isStarter ? 'Starting Pitcher' : 'Relief Pitcher';
  const showPitching = pitcher.isCurrentPitcher && !isFinal;
  const [playerPage, setPlayerPage] = useState(null);

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
      {playerPage && <PlayerPage playerId={playerPage.id} playerName={playerPage.name} onClose={() => setPlayerPage(null)} />}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
          <div onClick={() => setPlayerPage({ id: pitcher.id, name: pitcher.name })} style={{ cursor:'pointer' }}>
            <PlayerPhoto playerId={pitcher.id} name={pitcher.name} size={36} />
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
              <span
                onClick={() => setPlayerPage({ id: pitcher.id, name: pitcher.name })}
                style={{ color:'#60a5fa', textDecoration:'underline', textDecorationStyle:'dotted', textDecorationColor:'rgba(96,165,250,0.5)', cursor:'pointer' }}
              >{pitcher.name}</span>
              {isWinner && <span style={{ fontSize:10, background:'rgba(74,222,128,0.15)', color:'#4ade80', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>W</span>}
              {isLoser && <span style={{ fontSize:10, background:'rgba(248,113,113,0.15)', color:'#f87171', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>L</span>}
              {showPitching && <span style={{ fontSize:10, background:'rgba(251,191,36,0.15)', color:'#fbbf24', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>Pitching now</span>}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{roleLabel} · {pitcher.pitchCount} pitches</div>
            {(pitcher.seasonEra || pitcher.seasonWhip) && (
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:3, display:'flex', gap:10, flexWrap:'wrap' }}>
                {pitcher.seasonEra && <span style={{ display:'flex', alignItems:'center', gap:4 }}>ERA {pitcher.seasonEra} <TrendArrow rating={rateERA(pitcher.seasonEra)} size={11} /></span>}
                {pitcher.seasonWhip && <span style={{ display:'flex', alignItems:'center', gap:4 }}>WHIP {pitcher.seasonWhip} <TrendArrow rating={rateWHIP(pitcher.seasonWhip)} size={11} /></span>}
              </div>
            )}
          </div>
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {[['IP',pitcher.ip,false],['K',pitcher.k,false],['BB',pitcher.bb,false],['H',pitcher.h,false],['ER',pitcher.er,pitcher.er===0]].map(([label,val,good])=>(
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:16, fontWeight:600, color:good?'#4ade80':label==='ER'&&val>0?'#f87171':'#fff' }}>{val}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      {arsenal && <PitchBars pitches={arsenal} />}
    </div>
  );
}

function AIAnalysis({ awayPitchers, homePitchers, awayTeam, homeTeam, awayScore, homeScore, awayBatters, homeBatters, keyPlays, isFinal, inning, inningHalf }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sp1 = awayPitchers.find(p => p.isStarter);
    const sp2 = homePitchers.find(p => p.isStarter);
    const rel1 = awayPitchers.filter(p => !p.isStarter);
    const rel2 = homePitchers.filter(p => !p.isStarter);
    const hrs = keyPlays.filter(p => p.event === 'home_run');
    const topHitters = [...awayBatters, ...homeBatters]
      .filter(b => b.h > 1 || b.hr > 0)
      .map(b => `${b.name} (${b.h}H${b.hr > 0 ? ' ' + b.hr + 'HR' : ''})`)
      .join(', ');

    if (!sp1 && !sp2) { setText('No pitching data available yet.'); setLoading(false); return; }

    const lines = [];
    if (sp1) lines.push(`${sp1.name} (${awayTeam.abbr}): ${sp1.ip} IP, ${sp1.er} ER, ${sp1.k} K, ${sp1.bb} BB, ${sp1.pitchCount} pitches.${sp1.seasonEra ? ' Season ERA: ' + sp1.seasonEra + '.' : ''}`);
    if (rel1.length) lines.push(`${awayTeam.abbr} bullpen: ${rel1.map(p => `${p.name} ${p.ip}IP ${p.er}ER ${p.k}K`).join(', ')}.`);
    if (sp2) lines.push(`${sp2.name} (${homeTeam.abbr}): ${sp2.ip} IP, ${sp2.er} ER, ${sp2.k} K, ${sp2.bb} BB, ${sp2.pitchCount} pitches.${sp2.seasonEra ? ' Season ERA: ' + sp2.seasonEra + '.' : ''}`);
    if (rel2.length) lines.push(`${homeTeam.abbr} bullpen: ${rel2.map(p => `${p.name} ${p.ip}IP ${p.er}ER ${p.k}K`).join(', ')}.`);
    if (hrs.length) lines.push(`Home runs: ${hrs.map(h => h.batter).join(', ')}.`);
    if (topHitters) lines.push(`Standout hitters: ${topHitters}.`);

    const gameContext = isFinal
      ? `GAME STATUS: FINAL. Score: ${awayTeam.abbr} ${awayScore}, ${homeTeam.abbr} ${homeScore}.`
      : `GAME STATUS: IN PROGRESS. Score: ${awayTeam.abbr} ${awayScore}, ${homeTeam.abbr} ${homeScore}. Now: ${inningHalf || ''} ${inning || ''}.`;

    const tenseGuide = isFinal
      ? `The game has finished. Write entirely in PAST TENSE. Give a definitive verdict on why the game was won or lost.`
      : `The game is still in progress. Write entirely in PRESENT/PRESENT PERFECT TENSE. Focus on what has happened so far and what to watch.`;

    const prompt = `You are an expert baseball analyst. ${gameContext}

${tenseGuide}

${lines.join('\n')}

3-4 sentences of genuine insight. Focus on pitch efficiency (pitches per out = pitches divided by innings×3, good is 3.5-4.5), command, whether the line contradicts the score, bullpen impact, or a standout hitter. Never show infinity or ÷ symbols. If no walks, say "no walks allowed".`;

    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
    })
      .then(r => r.json())
      .then(d => { setText(d?.content?.find(b => b.type === 'text')?.text || buildFallback(sp1, sp2, isFinal)); })
      .catch(() => { setText(buildFallback(sp1, sp2, isFinal)); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildFallback(sp1, sp2, finished) {
    const parts = [];
    if (sp1) {
      const outs = parseFloat(sp1.ip) * 3;
      const ppo = outs > 0 ? (sp1.pitchCount / outs).toFixed(1) : '?';
      const kbb = sp1.bb > 0 ? (sp1.k / sp1.bb).toFixed(1) : 'no walks allowed';
      parts.push(`${sp1.name} ${finished?'threw':'has thrown'} ${sp1.pitchCount} pitches over ${sp1.ip} innings (${ppo} per out), K/BB ${kbb}.`);
    }
    if (sp2) {
      const kbb = sp2.bb > 0 ? (sp2.k / sp2.bb).toFixed(1) : 'no walks allowed';
      parts.push(`${sp2.name} ${finished?'went':'has gone'} ${sp2.ip} innings, K/BB ${kbb}, ${finished?'allowing':'having allowed'} ${sp2.er} earned run${sp2.er !== 1 ? 's' : ''}.`);
    }
    return parts.join(' ') || 'Analysis unavailable.';
  }

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:14 }}>
      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.5, color:'rgba(255,255,255,0.3)', fontWeight:600, marginBottom:8 }}>AI analysis</div>
      <div style={{ fontSize:13, lineHeight:1.7, color: loading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)', fontStyle: loading ? 'italic' : 'normal' }}>
        {loading ? 'Generating analysis...' : text}
      </div>
    </div>
  );
}

export function GameRecap({ awayTeam, homeTeam, awayScore, homeScore, awayPitchers, homePitchers, awayBatters, homeBatters, keyPlays, decisions }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const winner = awayScore > homeScore ? awayTeam : homeTeam;
    const loser = awayScore > homeScore ? homeTeam : awayTeam;
    const winScore = Math.max(awayScore, homeScore);
    const loseScore = Math.min(awayScore, homeScore);

    const sp1 = awayPitchers.find(p => p.isStarter);
    const sp2 = homePitchers.find(p => p.isStarter);
    const allRelievers = [...awayPitchers.filter(p=>!p.isStarter), ...homePitchers.filter(p=>!p.isStarter)];
    const hrs = keyPlays.filter(p => p.event === 'home_run');
    const scoringPlays = keyPlays.filter(p => p.rbi > 0).slice(0, 5);

    const allBatters = [...awayBatters, ...homeBatters];
    const topHitters = allBatters
      .filter(b => b.h >= 2 || b.hr > 0 || b.rbi >= 2)
      .sort((a, b) => (b.hr * 3 + b.rbi * 2 + b.h) - (a.hr * 3 + a.rbi * 2 + a.h))
      .slice(0, 4)
      .map(b => `${b.name} (${awayBatters.includes(b) ? awayTeam.abbr : homeTeam.abbr}): ${b.h}H, ${b.rbi}RBI${b.hr > 0 ? ', ' + b.hr + 'HR' : ''}${b.bb > 0 ? ', ' + b.bb + 'BB' : ''}`)
      .join('\n');

    const lines = [`${awayTeam.name} ${awayScore}, ${homeTeam.name} ${homeScore}`];
    if (decisions?.winner?.fullName) lines.push(`W: ${decisions.winner.fullName}${decisions.loser?.fullName ? '  L: ' + decisions.loser.fullName : ''}${decisions.save?.fullName ? '  SV: ' + decisions.save.fullName : ''}`);
    if (sp1) {
      const outs = parseFloat(sp1.ip) * 3;
      const ppo = outs > 0 ? (sp1.pitchCount / outs).toFixed(1) : '?';
      lines.push(`${sp1.name} (${awayTeam.abbr} SP): ${sp1.ip} IP, ${sp1.er} ER, ${sp1.k} K, ${sp1.bb} BB — ${ppo} pitches/out`);
    }
    if (sp2) {
      const outs = parseFloat(sp2.ip) * 3;
      const ppo = outs > 0 ? (sp2.pitchCount / outs).toFixed(1) : '?';
      lines.push(`${sp2.name} (${homeTeam.abbr} SP): ${sp2.ip} IP, ${sp2.er} ER, ${sp2.k} K, ${sp2.bb} BB — ${ppo} pitches/out`);
    }
    if (allRelievers.length) lines.push(`Relievers: ${allRelievers.map(p=>`${p.name} ${p.ip}IP/${p.er}ER`).join(', ')}`);
    if (hrs.length) lines.push(`HRs: ${hrs.map(h=>`${h.batter} (${h.half==='top'?awayTeam.abbr:homeTeam.abbr})`).join(', ')}`);
    if (topHitters) lines.push(`Key performers:\n${topHitters}`);
    if (scoringPlays.length) lines.push(`Scoring plays: ${scoringPlays.map(p=>`${p.batter} (${p.rbi} RBI)`).join(', ')}`);

    if (!sp1 && !sp2 && !topHitters) {
      setText(`${winner.name} defeated ${loser.name} ${winScore}-${loseScore}.`);
      setLoading(false);
      return;
    }

    const prompt = `You are writing a post-game recap for a baseball fan who just watched this game. Write 3-4 sentences in past tense. Be specific and analytical — reference actual players and stats. Do NOT start with the final score (they already know it). Lead with the most interesting story of the game: was it a dominant pitching performance? A comeback? A single player who drove everything?

Avoid: clichés, phrases like "gutsy" "electric" "fired up", generic praise.
Include: specific stat observations (pitch count efficiency, K/BB ratio, exit velos if notable), context for why something matters.

Game data:
${lines.join('\n')}`;

    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 350, messages: [{ role: 'user', content: prompt }] }),
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => {
        const t = d?.content?.find(b => b.type === 'text')?.text;
        if (t) setText(t);
        else throw new Error('no text');
      })
      .catch(() => {
        setError(true);
        // Build a decent fallback from the data we have
        const parts = [];
        if (sp1 || sp2) {
          const starter = sp1 && parseFloat(sp1.ip) >= parseFloat(sp2?.ip||0) ? sp1 : sp2;
          const team = starter === sp1 ? awayTeam : homeTeam;
          const outs = parseFloat(starter.ip) * 3;
          const ppo = outs > 0 ? (starter.pitchCount / outs).toFixed(1) : null;
          parts.push(`${starter.name} led ${team.name} with ${starter.ip} innings pitched, allowing ${starter.er} earned run${starter.er!==1?'s':''} on ${ppo ? ppo + ' pitches per out' : starter.pitchCount + ' pitches'}.`);
        }
        if (hrs.length) parts.push(`${hrs.map(h=>h.batter).join(' and ')} hit ${hrs.length > 1 ? 'home runs' : 'a home run'} in the game.`);
        if (topHitters.split('\n')[0]) {
          const top = allBatters.sort((a,b)=>(b.hr*3+b.rbi*2+b.h)-(a.hr*3+a.rbi*2+a.h))[0];
          if (top && (top.h >= 2 || top.rbi >= 2)) parts.push(`${top.name} went ${top.h}-for-${top.ab} with ${top.rbi} RBI.`);
        }
        if (!parts.length) parts.push(`${winner.name} defeated ${loser.name} ${winScore}-${loseScore}.`);
        setText(parts.join(' '));
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.5, color:'rgba(255,255,255,0.3)', fontWeight:600, marginBottom:10 }}>
        Game recap
      </div>
      <div style={{ fontSize:14, lineHeight:1.75, color: loading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)', fontStyle: loading ? 'italic' : 'normal' }}>
        {loading ? 'Writing recap...' : text}
      </div>
    </div>
  );
}

function BullpenSection({ awayTeam, homeTeam, awayPitchers, homePitchers }) {
  const teams = [
    { team: awayTeam, pitchers: awayPitchers },
    { team: homeTeam, pitchers: homePitchers },
  ];
  const hasRelievers = teams.some(({ pitchers }) => pitchers.some(p => !p.isStarter));
  if (!hasRelievers) return null;

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:14 }}>Bullpen — today's usage</div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginBottom:12 }}>Pitch counts from this game only</div>
      {teams.map(({ team, pitchers }) => {
        const relievers = pitchers.filter(p => !p.isStarter);
        if (!relievers.length) return null;
        return (
          <div key={team.abbr} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <TeamLogo abbr={team.abbr} size={18} />
              <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.5)' }}>{team.name}</span>
            </div>
            {relievers.map(p => {
              const outs = Math.round(parseFloat(p.ip || 0) * 3);
              const ppo = outs > 0 ? (p.pitchCount / outs).toFixed(1) : '—';
              return (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'0.5px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:'#fff' }}>{p.name}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>
                      {p.ip} IP · {p.pitchCount} pitches · {ppo} per out
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:10, textAlign:'center' }}>
                    {[['K',p.k,'#60a5fa'],['BB',p.bb,'rgba(255,255,255,0.6)'],['ER',p.er,p.er>0?'#f87171':'#4ade80']].map(([label,val,color])=>(
                      <div key={label}>
                        <div style={{ fontSize:15, fontWeight:600, color }}>{val}</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function PitchingTab({ data }) {
  const { awayTeam, homeTeam, awayPitchers, homePitchers, decisions, awayScore, homeScore, awayBatters, homeBatters, keyPlays, isFinal, inning, inningHalf } = data;
  const winnerName = decisions?.winner?.fullName || '';
  const loserName = decisions?.loser?.fullName || '';

  return (
    <div className="tab-panel">
      {[['away', awayTeam, awayPitchers], ['home', homeTeam, homePitchers]].map(([side, team, pitchers]) => (
        <div key={side} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, paddingBottom:10, borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
            <TeamLogo abbr={team.abbr} size={24} />
            <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{team.city} {team.name}</span>
          </div>
          {pitchers.map(p => (
            <PitcherCard key={p.id} pitcher={p} isFinal={isFinal}
              isWinner={winnerName && p.name === winnerName}
              isLoser={loserName && p.name === loserName}
            />
          ))}
          {!pitchers.length && <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'20px 0' }}>No pitching data yet</div>}
        </div>
      ))}
      <BullpenSection awayTeam={awayTeam} homeTeam={homeTeam} awayPitchers={awayPitchers} homePitchers={homePitchers} />
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <AIAnalysis awayPitchers={awayPitchers} homePitchers={homePitchers} awayTeam={awayTeam} homeTeam={homeTeam} awayScore={awayScore} homeScore={homeScore} awayBatters={awayBatters||[]} homeBatters={homeBatters||[]} keyPlays={keyPlays||[]} isFinal={isFinal} inning={inning} inningHalf={inningHalf} />
      </div>
    </div>
  );
}
