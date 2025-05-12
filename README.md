# Stripe App

## Projecto para integración de Stripe como pasarela de pago

Este projecto es una demp que se engloba en las tareas de Formación en centros de trabajo FCT y permite la integración completamente funcional
de Stripe en un proyecto React.

## Requisitos

- Tecnologías: React para el front y Laravel para el back
- Estilos: Styles-Components para reusabilidad

## Funcionalidad

- El usuario indica un importe, este importe se le cobra a través de Stripe, el formulario de pago debe estar en la propia aplicación de React, para que el usuario no salga del flujo actual.

- El importe cobrado al usuario, se registra como transacción en una BBDD y se le añade a su monedero virtual.

- El usuario puede realizar microtrasacciones con el importe del monedero, de diferentes elementos.

- El usuario puede solicitar el reembolso del dinero restante en su monedero.

- Dicho esto, a nivel de demo valdría con implementar una vista en la aplicación de React, con un input field y tres botones, recargar, realizar micropago y reembolsar.

- Cuando el usuario pulse en recargar aparecerá el formulario de pago donde deberá introducir los datos de su forma de pago y realizar el proceso con Stripe, teniendo en cuenta los distintos escenarios posibles, pago aceptado, rechazado, es necesaria validación del pago…

- Cuando el usuario pulse en micropago, comprobar si tiene suficiente dinero en el monedero para realizarla, anotar la transacción.

- Cuando el usuario solicite un reembolso, comprobar si Stripe permite automatizar esta acción o si es necesario realizarla de forma manual.

## Imagen de la app

[![StripeApp](./stripeApp.png)](./stripeApp.png)
