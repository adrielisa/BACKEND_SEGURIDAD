# Contribuyendo al Proyecto

¡Gracias por tu interés en contribuir! 🎉

## 🤝 Cómo Contribuir

### 1. Fork del Proyecto

1. Haz fork del repositorio
2. Clona tu fork localmente
```bash
git clone https://github.com/tu-usuario/backend-seguridad.git
cd backend-seguridad
```

### 2. Crear una Rama

Crea una rama para tu feature o bug fix:
```bash
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b fix/correccion-bug
```

**Nomenclatura de ramas:**
- `feature/` - Para nuevas funcionalidades
- `fix/` - Para corrección de bugs
- `docs/` - Para cambios en documentación
- `refactor/` - Para refactorización de código
- `test/` - Para agregar o mejorar tests

### 3. Hacer Cambios

1. Realiza tus cambios siguiendo las guías de estilo
2. Asegúrate de que los tests pasen
3. Agrega tests para nueva funcionalidad
4. Actualiza la documentación si es necesario

### 4. Commit

Usa mensajes de commit descriptivos siguiendo Conventional Commits:

```bash
git commit -m "feat: agregar endpoint para estadísticas de usuarios"
git commit -m "fix: corregir validación de email en registro"
git commit -m "docs: actualizar README con ejemplos de uso"
```

**Tipos de commit:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, sin cambios de código
- `refactor`: Refactorización sin cambiar funcionalidad
- `test`: Agregar o modificar tests
- `chore`: Cambios en build, configuración, etc.

### 5. Push y Pull Request

```bash
git push origin feature/nueva-funcionalidad
```

Luego crea un Pull Request desde GitHub:
1. Ve a tu fork en GitHub
2. Click en "Compare & pull request"
3. Describe tus cambios detalladamente
4. Espera la revisión

## 📋 Checklist antes de PR

- [ ] El código sigue el estilo del proyecto
- [ ] Los tests pasan (`npm test`)
- [ ] No hay errores de linting (`npm run lint`)
- [ ] Se agregaron tests para nueva funcionalidad
- [ ] La documentación está actualizada
- [ ] El commit sigue Conventional Commits
- [ ] No hay console.logs olvidados
- [ ] Las variables de entorno sensibles no están hardcodeadas

## 🎨 Guías de Estilo

### JavaScript/Node.js

- Usa ES6+ features
- 2 espacios para indentación
- Usa `const` por defecto, `let` cuando sea necesario
- Nombres descriptivos para variables y funciones
- Comentarios JSDoc para funciones públicas
- Async/await sobre Promises cuando sea posible

### Ejemplo:

```javascript
/**
 * Obtiene usuarios con paginación
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Object>} Usuarios y datos de paginación
 */
async function getUsers(page, limit) {
  const offset = (page - 1) * limit;
  const users = await User.findAll({ offset, limit });
  return { users, page, limit };
}
```

### API

- Endpoints en plural: `/users`, `/products`
- Verbos HTTP correctos: GET, POST, PUT, PATCH, DELETE
- Códigos de estado apropiados
- Respuestas consistentes con estructura:
```json
{
  "status": "success",
  "data": { ... }
}
```

### Tests

- Nombres descriptivos de tests
- Un concepto por test
- Arrange-Act-Assert pattern
- Mock de dependencias externas

## 🐛 Reportar Bugs

Si encuentras un bug:

1. Verifica que no esté ya reportado en Issues
2. Crea un nuevo Issue con:
   - Título descriptivo
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Versión de Node.js y dependencias
   - Logs o screenshots si aplica

## 💡 Sugerir Funcionalidades

Para sugerir nuevas funcionalidades:

1. Abre un Issue con tag "enhancement"
2. Describe claramente la funcionalidad
3. Explica el caso de uso
4. Especifica beneficios

## ❓ Preguntas

Si tienes preguntas:
1. Revisa la documentación
2. Busca en Issues cerrados
3. Abre un nuevo Issue con tag "question"

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones sean licenciadas bajo la misma licencia del proyecto (MIT).

## 🙏 Agradecimientos

¡Gracias por hacer este proyecto mejor! Cada contribución, por pequeña que sea, es valiosa.

---

**Happy Coding!** 💻 ✨
