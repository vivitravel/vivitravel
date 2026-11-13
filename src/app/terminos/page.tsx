import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso de Vivitravels.",
  robots: { index: false },
};

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <div className="mb-10 rounded-xl border border-orange/30 bg-orange/5 px-5 py-4 text-sm text-navy/70">
        <strong className="text-navy">Borrador pendiente de revisión legal.</strong>{" "}
        Los campos marcados con <code>[●]</code> deben completarse con los datos legales y fiscales del titular antes de la publicación definitiva.
      </div>

      <h1 className="mb-1 text-3xl font-extrabold text-navy">Términos y Condiciones de Uso</h1>
      <p className="mb-10 text-sm text-muted">Última actualización: [●]</p>

      <div className="space-y-8 text-[15px] leading-relaxed text-navy/80">

        <p>
          Estos Términos y Condiciones (<strong>"Términos"</strong>) regulan el acceso y uso del sitio web, aplicación y demás canales digitales operados bajo la marca Vivitravels (la <strong>"Plataforma"</strong>). Al acceder o utilizar la Plataforma, el usuario declara haber leído y comprendido estos Términos y acepta quedar sujeto a ellos, sin perjuicio de los derechos irrenunciables que le correspondan conforme a la normativa aplicable.
        </p>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">1. Identificación del titular</h2>
          <p>
            La Plataforma es operada por <strong>[NOMBRE / RAZÓN SOCIAL]</strong>, CUIT <strong>[●]</strong>, con domicilio en <strong>[●]</strong>, correo electrónico de contacto <strong>[●]</strong> (<strong>"Vivitravels"</strong>). Antes de publicar estos Términos deberán completarse estos datos y cualquier otra identificación exigida por la normativa aplicable.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">2. Objeto de Vivitravels</h2>
          <p>
            Vivitravels funciona como una plataforma digital de promoción, difusión y derivación de usuarios hacia prestadores independientes vinculados con turismo, alojamiento, gastronomía, actividades, experiencias y otros servicios relacionados.
          </p>
          <p className="mt-3">
            En el modelo actual, salvo que se indique expresamente lo contrario para un servicio determinado, Vivitravels no concreta la reserva ni cobra al viajero el precio del servicio turístico publicado. La contratación, confirmación, disponibilidad, pago y prestación del servicio se realizan directamente entre el usuario y el prestador correspondiente.
          </p>
          <p className="mt-3">
            La descripción anterior no excluye las responsabilidades que legalmente pudieran corresponder a Vivitravels por sus propios actos, contenidos, servicios o por normas de orden público aplicables.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">3. Usuarios</h2>
          <p>
            Podrán utilizar la Plataforma las personas con capacidad legal suficiente para realizar los actos que correspondan. El usuario se compromete a utilizar la Plataforma de buena fe, con fines lícitos y respetando estos Términos y la legislación aplicable.
          </p>
          <p className="mt-3">
            Cuando se solicite información para realizar una consulta, recibir novedades o contactar a un prestador, el usuario deberá proporcionar datos verdaderos, completos y actualizados.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">4. Prestadores publicados</h2>
          <p>
            Los alojamientos, actividades, comercios y demás prestadores exhibidos en Vivitravels son terceros independientes, salvo indicación expresa en contrario.
          </p>
          <p className="mt-3">
            Cada prestador es responsable de mantener actualizada y veraz la información correspondiente a sus servicios, incluyendo características, disponibilidad, condiciones, requisitos, restricciones, habilitaciones, precios y demás información comercial que corresponda.
          </p>
          <p className="mt-3">
            Vivitravels podrá solicitar correcciones, suspender o retirar publicaciones cuando detecte información manifiestamente incorrecta, desactualizada, ilícita, engañosa o incompatible con las reglas de la Plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">5. Información, precios y disponibilidad</h2>
          <p>
            Vivitravels procura que la información publicada sea clara y actualizada. Sin embargo, determinados contenidos pueden ser proporcionados directamente por los prestadores y variar luego de su publicación.
          </p>
          <p className="mt-3">
            Antes de contratar, el usuario deberá verificar con el prestador las condiciones vigentes, incluyendo precio final, moneda, disponibilidad, impuestos, política de cancelación, requisitos y características esenciales del servicio.
          </p>
          <p className="mt-3">
            Cuando una oferta sea emitida directamente por Vivitravels respecto de un servicio propio, se informarán las condiciones aplicables de manera clara y se respetarán los derechos del consumidor previstos por la normativa vigente.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">6. Derivación y contratación con terceros</h2>
          <p>
            La Plataforma puede incluir botones, enlaces o medios de contacto que deriven al usuario al sitio web, WhatsApp, Instagram, Facebook, sistema de reservas u otro canal del prestador.
          </p>
          <p className="mt-3">
            Desde el momento en que el usuario abandona Vivitravels y opera en un canal externo, la interacción se encuentra también sujeta a las condiciones y políticas del tercero correspondiente. Vivitravels no controla técnicamente esos servicios externos.
          </p>
          <p className="mt-3">
            Las condiciones específicas de una contratación entre usuario y prestador —incluyendo reservas, pagos, cancelaciones, reembolsos y ejecución del servicio— deberán ser informadas y gestionadas por el prestador, sin perjuicio de las responsabilidades que la legislación aplicable pueda atribuir a cada interviniente.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">7. Consultas, leads y comunicaciones</h2>
          <p>
            Cuando el usuario voluntariamente envíe una consulta o solicite contacto con un prestador, Vivitravels podrá tratar los datos necesarios para gestionar dicha solicitud y, cuando corresponda y exista una base legal adecuada, transmitirlos al prestador elegido.
          </p>
          <p className="mt-3">
            El envío de comunicaciones promocionales, novedades o campañas estará sujeto a las opciones de consentimiento y baja que correspondan. El usuario podrá solicitar dejar de recibir comunicaciones comerciales mediante el mecanismo indicado en cada mensaje o a través del canal de privacidad informado por Vivitravels.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">8. Datos personales y privacidad</h2>
          <p>
            El tratamiento de datos personales se regirá por la Política de Privacidad de Vivitravels y la normativa aplicable. Los titulares podrán ejercer los derechos que les reconozca la legislación aplicable, incluyendo acceso, actualización, rectificación y supresión cuando corresponda.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">9. Cookies, medición y publicidad digital</h2>
          <p>
            Vivitravels podrá utilizar tecnologías de medición, cookies, píxeles u otras herramientas para operar la Plataforma, analizar su utilización, medir campañas y, cuando corresponda, realizar acciones publicitarias o de remarketing. La utilización de estas tecnologías se informa mediante la Política de Privacidad.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">10. Propiedad intelectual</h2>
          <p>
            La marca Vivitravels, su identidad visual, diseño, software, textos, fotografías, gráficos y demás contenidos propios de la Plataforma se encuentran protegidos por las normas aplicables de propiedad intelectual e industrial.
          </p>
          <p className="mt-3">
            Los contenidos proporcionados por los prestadores continuarán perteneciendo a sus respectivos titulares. Al entregarlos a Vivitravels para su publicación, el prestador deberá contar con los derechos y autorizaciones necesarios y otorgar a Vivitravels una licencia suficiente para reproducirlos, adaptarlos técnicamente, publicarlos y promocionarlos durante la vigencia de la relación comercial.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">11. Uso prohibido</h2>
          <p>
            No está permitido utilizar la Plataforma para realizar actividades ilícitas, fraudulentas o engañosas; vulnerar derechos de terceros; introducir software malicioso; intentar acceder sin autorización a sistemas o información; recopilar datos de otros usuarios de manera no autorizada; o utilizar contenidos de Vivitravels fuera de los usos permitidos por estos Términos.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">12. Responsabilidad</h2>
          <p>
            Vivitravels responde por las obligaciones y responsabilidades que legalmente le correspondan respecto de sus propios servicios y actuaciones.
          </p>
          <p className="mt-3">
            Cuando el servicio turístico sea contratado y prestado por un tercero independiente, las obligaciones propias de esa prestación corresponden al prestador en los términos de la contratación y de la legislación aplicable.
          </p>
          <p className="mt-3">
            Ninguna disposición de estos Términos debe interpretarse como una renuncia o limitación de derechos irrenunciables del consumidor ni como una exclusión de responsabilidad que resulte prohibida por la normativa vigente.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">13. Reclamos y atención</h2>
          <p>
            Los usuarios podrán comunicarse con Vivitravels a través de <strong>[●]</strong> para consultas o reclamos vinculados con el funcionamiento de la Plataforma o con servicios propios de Vivitravels.
          </p>
          <p className="mt-3">
            Cuando el reclamo corresponda a una prestación contratada directamente con un tercero, Vivitravels podrá facilitar la identificación o canal de contacto del prestador, sin que ello sustituya las obligaciones legales que correspondan a cada parte.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">14. Servicios pagos de Vivitravels</h2>
          <p>
            Si Vivitravels ofrece al usuario final servicios pagos propios mediante contratación a distancia, se informarán previamente el precio, condiciones, alcance, mecanismos de cancelación y demás información legalmente exigible. Cuando resulte aplicable, se implementarán los mecanismos de revocación o arrepentimiento requeridos por la normativa vigente.
          </p>
          <p className="mt-3">
            Las condiciones comerciales entre Vivitravels y los prestadores que contraten publicaciones, campañas, publicidad o asesoramiento se regularán además por el contrato o condiciones comerciales específicas aplicables a dichos servicios.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">15. Modificaciones</h2>
          <p>
            Vivitravels podrá actualizar funcionalidades y modificar estos Términos cuando resulte necesario por cambios operativos, comerciales o normativos. La versión vigente indicará su fecha de actualización.
          </p>
          <p className="mt-3">
            Las modificaciones no afectarán retroactivamente derechos adquiridos ni podrán reducir derechos que resulten irrenunciables conforme a la legislación aplicable.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">16. Legislación aplicable y jurisdicción</h2>
          <p>
            Estos Términos se regirán por las leyes de la República Argentina, sin perjuicio de las normas imperativas que puedan resultar aplicables según el domicilio del consumidor o la naturaleza de la relación.
          </p>
          <p className="mt-3">
            En relaciones de consumo, cualquier cuestión de competencia o jurisdicción se resolverá conforme a las normas protectorias aplicables y no se interpretará esta cláusula como una renuncia del consumidor a los fueros o derechos que legalmente le correspondan.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-navy">17. Contacto</h2>
          <div className="rounded-xl bg-surface p-5 text-sm">
            <p><strong>Vivitravels</strong></p>
            <p>Titular / Razón social: <strong>[●]</strong></p>
            <p>CUIT: <strong>[●]</strong></p>
            <p>Domicilio: <strong>[●]</strong></p>
            <p>Correo electrónico: <strong>[●]</strong></p>
          </div>
        </section>

      </div>
    </main>
  );
}
