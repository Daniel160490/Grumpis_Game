export interface Ataque {
    nombre: string;
    efecto: string;
    tipo: string;
}

export interface Grumpi {
    id: number;
    nombre: string;
    PS: number;
    n_grumpidex: string;
    clase: "basico" | "evolucion" | "legendario";
    img_general: string;
    descripcion: string;
    tipo: string;
    ataques: Ataque[];
}