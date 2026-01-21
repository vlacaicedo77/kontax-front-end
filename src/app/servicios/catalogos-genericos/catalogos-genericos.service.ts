import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map, catchError, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {
  
  // Cache por nombre de catálogo
  private cache = new Map<string, { data: any[], timestamp: number, observable: Observable<any[]> }>();
  
  // Tiempo de expiración de caché (30 minutos)
  private readonly CACHE_DURATION = 30 * 60 * 1000;
  
  // Lista de catálogos que se están cargando actualmente
  private loadingCatalogs = new Map<string, Observable<any[]>>();

  constructor(private http: HttpClient) { }

  /**
   * Obtiene un catálogo por nombre
   * @param nombreCatalogo Nombre del catálogo (debe coincidir con el endpoint del backend)
   * @param forzarRefresh Si true, ignora el caché y obtiene datos frescos
   * @returns Observable con el array de items del catálogo
   */
  obtenerCatalogo(nombreCatalogo: string, forzarRefresh: boolean = false): Observable<any[]> {
    // Validar si tenemos datos cacheados válidos
    if (!forzarRefresh && this.tieneCacheValido(nombreCatalogo)) {
      return of(this.cache.get(nombreCatalogo)!.data);
    }
    
    // Si ya hay una petición en curso para este catálogo, reutilizarla
    if (this.loadingCatalogs.has(nombreCatalogo)) {
      return this.loadingCatalogs.get(nombreCatalogo)!;
    }
    
    // Crear nueva petición
    const url = `${environment.URL_SERVICIOS}catalogos/${nombreCatalogo}`;
    const nuevoObservable = this.http.get<any>(url).pipe(
      map(response => {
        const datos = response.resultado || response.data || response;
        
        // Almacenar en caché
        this.cache.set(nombreCatalogo, {
          data: datos,
          timestamp: Date.now(),
          observable: nuevoObservable
        });
        
        // Limpiar de "en carga"
        this.loadingCatalogs.delete(nombreCatalogo);
        
        return datos;
      }),
      catchError(error => {
        // Limpiar en caso de error
        this.loadingCatalogs.delete(nombreCatalogo);
        throw error;
      }),
      shareReplay(1) // Importante: Comparte la misma respuesta con múltiples suscriptores
    );
    
    // Registrar que este catálogo se está cargando
    this.loadingCatalogs.set(nombreCatalogo, nuevoObservable);
    
    return nuevoObservable;
  }

  /**
   * Obtiene múltiples catálogos simultáneamente (ideal para formularios)
   * @param nombresCatalogos Array con los nombres de los catálogos a cargar
   * @returns Observable con un objeto que mapea cada catálogo a sus datos
   */
  obtenerMultiplesCatalogos(nombresCatalogos: string[]): Observable<{ [key: string]: any[] }> {
    const requests: { [key: string]: Observable<any[]> } = {};
    
    nombresCatalogos.forEach(nombre => {
      requests[nombre] = this.obtenerCatalogo(nombre);
    });
    
    return forkJoin(requests);
  }

  /**
   * Obtiene un catálogo con filtros específicos (no usa caché)
   * @param nombreCatalogo Nombre del catálogo
   * @param filtros Objeto con filtros a aplicar
   */
  obtenerCatalogoConFiltros(nombreCatalogo: string, filtros: any): Observable<any[]> {
    const url = `${environment.URL_SERVICIOS}catalogos/${nombreCatalogo}`;
    return this.http.get<any>(url, { params: filtros }).pipe(
      map(response => response.resultado || response.data || response)
    );
  }

  /**
   * Limpia el caché de un catálogo específico o de todos
   * @param nombreCatalogo Opcional. Si se especifica, limpia solo ese catálogo
   */
  limpiarCache(nombreCatalogo?: string): void {
    if (nombreCatalogo) {
      this.cache.delete(nombreCatalogo);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Obtiene el tiempo restante de caché para un catálogo
   * @param nombreCatalogo Nombre del catálogo
   * @returns Tiempo en milisegundos, 0 si no hay caché o expiró
   */
  obtenerTiempoRestanteCache(nombreCatalogo: string): number {
    const cached = this.cache.get(nombreCatalogo);
    if (!cached) return 0;
    
    const tiempoTranscurrido = Date.now() - cached.timestamp;
    const tiempoRestante = this.CACHE_DURATION - tiempoTranscurrido;
    
    return Math.max(0, tiempoRestante);
  }

  /**
   * Verifica si un catálogo tiene caché válido
   */
  private tieneCacheValido(nombreCatalogo: string): boolean {
    const cached = this.cache.get(nombreCatalogo);
    if (!cached) return false;
    
    const tiempoTranscurrido = Date.now() - cached.timestamp;
    return tiempoTranscurrido < this.CACHE_DURATION;
  }
}