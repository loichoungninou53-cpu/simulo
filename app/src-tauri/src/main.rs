// SIMULO — point d'entrée desktop.
//
// En release Windows : pas de console qui s'ouvre à côté de l'app.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    simulo_lib::run()
}
