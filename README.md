# VIK · Websites V2

**Desarrollo gráfico: 21%.** Avance declarado del diseño; no representa el porcentaje de archivos subidos.

**Primer y único proyecto validado por el equipo hasta el momento: VIK JOSÉ IGNACIO.** Todos los demás proyectos continúan en **beta**. Esta validación gráfica no implica una auditoría técnica de producción.

## Proyectos

| Proyecto | Estado gráfico | Carpeta |
| --- | --- | --- |
| VIK JOSÉ IGNACIO | Validado | [vik-jose-ignacio](./vik-jose-ignacio/) |
| Bahía VIK | Beta | [bahia-vik](./bahia-vik/) |
| Celebrate | Beta | [celebrate](./celebrate/) |
| Contact | Beta | [contact](./contact/) |
| Destination | Beta | [destination](./destination/) |
| Dining | Beta | [dining](./dining/) |
| Estancia VIK | Beta | [estancia-vik](./estancia-vik/) |
| Experiences | Beta | [experiences](./experiences/) |
| Flujo | Beta | [flujo](./flujo/) |
| Guest Journey | Beta | [guest-journey](./guest-journey/) |
| La Susana | Beta | [la-susana](./la-susana/) |
| Pavilion VIK | Beta | [pavilion-vik](./pavilion-vik/) |
| Playa VIK | Beta | [playa-vik](./playa-vik/) |
| Room | Beta | [room](./room/) |
| Stay | Beta | [stay](./stay/) |
| Styleguide | Beta | [styleguide](./styleguide/) |
| Vik Retreats | Beta | [vik-retreats](./vik-retreats/) |
| Vik Wellness | Beta | [vik-wellness](./vik-wellness/) |

## Contenido del repositorio

- Código HTML, CSS y JavaScript, scripts de apoyo, datos y documentación.
- Assets utilizados por las páginas actuales: tipografías, logotipos e imágenes compartidas.
- Fotografías y versiones responsive referenciadas por las páginas, galerías y fichas de habitaciones.
- Videos referenciados, incluidos los posters y variantes móviles que utiliza el código.

## Carga de media

Prioridad: completar VIK José Ignacio antes de los proyectos en beta. En cada grupo se cargan primero assets, luego imágenes de menor a mayor peso y finalmente videos. El orden corresponde a los lotes de commits y publicación; Git gestiona internamente la transferencia.

Estado del inventario seleccionado: **7 de 566 archivos incorporados** (0.2 MB).

La selección se basa en referencias del código de las páginas actuales y sus dependencias, incluidos recursos dinámicos identificados. Se excluyen archivos utilizados únicamente por páginas `_legacy`/`_v1`, respaldos y medios sin referencias detectadas. No se copia íntegramente la biblioteca local. No equivale a una comprobación visual de todas las interacciones.

[Inventario completo de media: rutas, peso, páginas que la usan y estado de carga](./MEDIA-INVENTORY.md).

## Estructura compartida

- [`_assets/`](./_assets/): recursos compartidos.
- [`assets/`](./assets/): recursos comunes de diseño.
- [`_core/`](./_core/): estilos y scripts compartidos.
- Cada proyecto conserva sus rutas relativas y sus recursos propios.

## Vista local

Servir la raíz con un servidor estático y abrir `/vik-jose-ignacio/`. Los enlaces de carpetas de GitHub muestran el código; este repositorio no configura GitHub Pages.
