import "./main.css";
import component from "./component";
import "purecss"
import "font-awesome/css/font-awesome.css";
import "react";
import { bake } from "./shake";

document.body.appendChild(component());

bake();
