# Valeria+ · Notas para Claude Code

## Correo de contacto (regla fija)

El correo de contacto del proyecto es **siempre**:

```
frank.alberto.betances.reinoso@gmail.com
```

Aplica sin excepción a la política de privacidad, la página de eliminación de
datos, los formularios de Google Play Console, las declaraciones de
responsable del tratamiento y cualquier documento legal o de contacto que se
genere o edite.

No lo sustituyas por una dirección de dominio (`@futureforkids.eu` u otra)
aunque parezca más institucional, ni propongas el cambio como mejora: es una
decisión ya tomada. Si alguna vez cambia, lo dirá Frank explícitamente.

## Sitio legal (`site/` → GitHub Pages)

Las URLs declaradas en Play Console salen de aquí; si cambian, hay que
actualizarlas también en Play Console:

| Página | URL |
| --- | --- |
| Política de privacidad (ES) | `https://frankbetances.github.io/Valeria/privacidad.html` |
| Privacy policy (EN) | `https://frankbetances.github.io/Valeria/privacy.html` |
| Eliminación de datos | `https://frankbetances.github.io/Valeria/eliminacion-de-datos.html` |

Se publica con [`.github/workflows/pages.yml`](.github/workflows/pages.yml),
que construye el artefacto **solo** desde `site/`: el código, las docs internas
de planificación y el corpus de voz no se publican. La fuente de Pages debe
seguir en *Settings → Pages → Source: **GitHub Actions***; si vuelve a *Deploy
from a branch*, el despliegue falla en dos segundos sin runner, sin pasos y sin
logs.

**Al cambiar lo que la app recoge** —un permiso nuevo, un campo nuevo en la
ficha del paciente, un SDK de terceros— hay que actualizar en el mismo cambio
la política de `site/` **y** el formulario de *Seguridad de los datos* de Play
Console: Google contrasta ambas declaraciones entre sí.
