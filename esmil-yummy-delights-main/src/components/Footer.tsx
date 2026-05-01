import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail } from "lucide-react";
import { BUSINESS } from "@/store/cart";

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-24">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🍭</span>
            <span className="font-display text-xl font-bold">EsmilDelicias</span>
          </div>
          <p className="text-background/70 text-sm">
            Tu suplidora favorita de dulces, snacks y bebidas. ¡Sabor y energía a domicilio!
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg mb-3">Enlaces</h4>
          <ul className="space-y-2 text-sm text-background/80">
            <li><Link to="/productos" className="hover:text-brand-sky">Productos</Link></li>
            <li><Link to="/reservar" className="hover:text-brand-sky">Reservar pedido</Link></li>
            <li><Link to="/nosotros" className="hover:text-brand-sky">Sobre nosotros</Link></li>
            <li><Link to="/contacto" className="hover:text-brand-sky">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-3">Contacto</h4>
          <ul className="space-y-2 text-sm text-background/80">
            <li className="flex items-start gap-2"><MapPin className="size-4 mt-0.5 text-brand-sky" />{BUSINESS.address}</li>
            <li className="flex items-center gap-2"><Phone className="size-4 text-brand-sky" /><a href="tel:+18092017995" className="hover:text-brand-sky">+1 (809) 201-7995</a></li>
            <li className="flex items-center gap-2"><Mail className="size-4 text-brand-sky" />{BUSINESS.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10 py-4 text-center text-xs text-background/60">
        © {new Date().getFullYear()} EsmilDelicias. Todos los derechos reservados.
      </div>
    </footer>
  );
}
