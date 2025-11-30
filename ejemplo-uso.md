# Ejemplos de Uso del Servidor

## Ejemplos con cURL

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Crear un Marcador
```bash
curl -X POST http://localhost:3000/api/marcadores \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 11.0049,
    "lng": -74.8060,
    "categoria": "alerta",
    "descripcion": "Marcador de prueba con más de 10 caracteres para validación"
  }'
```

### 3. Obtener Todos los Marcadores
```bash
curl http://localhost:3000/api/marcadores
```

### 4. Obtener un Marcador por ID
```bash
curl http://localhost:3000/api/marcadores/{id}
```

### 5. Actualizar un Marcador
```bash
curl -X PUT http://localhost:3000/api/marcadores/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 11.0050,
    "lng": -74.8061,
    "categoria": "peligro",
    "descripcion": "Marcador actualizado con nueva descripción"
  }'
```

### 6. Eliminar un Marcador
```bash
curl -X DELETE http://localhost:3000/api/marcadores/{id}
```

### 7. Guardar Coordenada GPS
```bash
curl -X POST http://localhost:3000/api/coordenadas \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 11.0049,
    "lng": -74.8060,
    "accuracy": 10.5
  }'
```

### 8. Obtener Últimas Coordenadas
```bash
curl "http://localhost:3000/api/coordenadas?limit=50"
```

### 9. Obtener Coordenadas por Rango
```bash
curl "http://localhost:3000/api/coordenadas/rango?fechaInicio=2024-01-01T00:00:00Z&fechaFin=2024-12-31T23:59:59Z"
```

### 10. Obtener Estadísticas
```bash
curl http://localhost:3000/api/marcadores/stats/estadisticas
```

## Ejemplos con JavaScript/TypeScript

### Usar el servicio API en Angular

```typescript
import { Component, OnInit } from '@angular/core';
import { ApiService, Marcador } from './services/api.service';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-example',
  template: '...'
})
export class ExampleComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    // Obtener marcadores desde la API
    this.apiService.getMarcadores().subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Marcadores:', response.data);
        }
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });

    // Escuchar nuevos marcadores en tiempo real
    this.socketService.onMarcadorCreado().subscribe((marcador) => {
      console.log('Nuevo marcador creado:', marcador);
    });
  }

  crearMarcador() {
    const nuevoMarcador = {
      lat: 11.0049,
      lng: -74.8060,
      categoria: 'alerta' as const,
      descripcion: 'Descripción del marcador con más de 10 caracteres'
    };

    this.apiService.createMarcador(nuevoMarcador).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Marcador creado:', response.data);
        }
      },
      error: (error) => {
        console.error('Error al crear marcador:', error);
      }
    });
  }

  enviarCoordenada() {
    // Enviar coordenada GPS en tiempo real
    this.socketService.enviarCoordenada(11.0049, -74.8060, 10.5);
  }
}
```

## Pruebas con Postman

1. Importa la colección de Postman (si está disponible)
2. O usa los ejemplos de cURL anteriores
3. Configura la URL base: `http://localhost:3000/api`

## Pruebas con Socket.IO Client

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Conectado:', socket.id);
});

socket.on('marcadores:iniciales', (marcadores) => {
  console.log('Marcadores iniciales:', marcadores);
});

socket.on('marcador:creado', (marcador) => {
  console.log('Nuevo marcador:', marcador);
});

// Enviar coordenada
socket.emit('coordenada:actualizar', {
  lat: 11.0049,
  lng: -74.8060,
  accuracy: 10.5
});
```

