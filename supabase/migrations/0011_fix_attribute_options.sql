-- Corrige opciones de edad en Actividades y experiencias (spec 13/11)
-- Antes: "20 a 40 años", "41 a 50 años", "Más de 50 años"
-- Ahora: "De 20 a 45 años", "Más de 45 años"
update category_attributes
set options = '["Menos de 20 años","De 20 a 45 años","Más de 45 años"]'
where category_slug = 'actividades-y-experiencias'
  and attribute_key = 'edad_recomendada';

-- Agrega "Guía turístico" a Servicios (spec 13/11)
update category_attributes
set options = '["Auto","Combi","City tour","Chofer","Alquiler de bicicleta","Guía turístico"]'
where category_slug = 'servicios'
  and attribute_key = 'transporte';
