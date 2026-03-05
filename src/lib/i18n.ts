import { create } from 'zustand';

type Locale = 'es' | 'en';

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  es: {
    // Nav
    'nav.discover': 'Descubrir',
    'nav.login': 'Iniciar Sesión',
    'nav.signup': 'Crear Cuenta',
    'nav.logout': 'Cerrar Sesión',
    'nav.myBookings': 'Mis Reservas',
    'nav.profile': 'Perfil',
    'nav.dashboard': 'Panel',
    'nav.language': 'EN',

    // Landing
    'landing.hero.title': 'Descubre el mundo submarino',
    'landing.hero.subtitle': 'Planifica y reserva inmersiones increíbles en los mejores destinos de Latinoamérica',
    'landing.hero.cta.diver': 'Explorar Inmersiones',
    'landing.hero.cta.center': 'Soy Centro de Buceo',
    'landing.features.title': '¿Por qué Scuba Planner?',
    'landing.features.discover.title': 'Descubre Inmersiones',
    'landing.features.discover.desc': 'Encuentra los mejores trips de buceo cerca de ti con información detallada',
    'landing.features.book.title': 'Reserva Fácil',
    'landing.features.book.desc': 'Solicita tu lugar en un click y coordina todo con el centro de buceo',
    'landing.features.connect.title': 'Conecta con el Grupo',
    'landing.features.connect.desc': 'Chat grupal con otros buzos confirmados y comunicación directa por WhatsApp',
    'landing.features.manage.title': 'Gestiona tu Centro',
    'landing.features.manage.desc': 'Panel completo para administrar trips, reservas y equipo de trabajo',
    'landing.cta.title': '¿Listo para sumergirte?',
    'landing.cta.diver': 'Crear Cuenta de Buzo',
    'landing.cta.center': 'Registrar mi Centro',

    // Auth
    'auth.login.title': 'Bienvenido de vuelta',
    'auth.login.subtitle': 'Inicia sesión para continuar',
    'auth.signup.title': 'Crea tu cuenta',
    'auth.signup.subtitle': 'Únete a la comunidad de buceo',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.login.button': 'Iniciar Sesión',
    'auth.signup.button': 'Crear Cuenta',
    'auth.google': 'Continuar con Google',
    'auth.login.link': '¿Ya tienes cuenta? Inicia sesión',
    'auth.signup.link': '¿No tienes cuenta? Crea una',
    'auth.forgot': '¿Olvidaste tu contraseña?',

    // Role Selection
    'role.title': '¿Cómo usarás Scuba Planner?',
    'role.diver.title': 'Soy Buzo',
    'role.diver.desc': 'Quiero descubrir y reservar inmersiones',
    'role.center.title': 'Centro de Buceo',
    'role.center.desc': 'Quiero gestionar trips y reservas',

    // Admin
    'admin.nav.dashboard': 'Dashboard',
    'admin.nav.trips': 'Trips',
    'admin.nav.bookings': 'Reservas',
    'admin.nav.staff': 'Equipo',
    'admin.nav.settings': 'Configuración',

    'admin.dashboard.title': 'Panel de Control',
    'admin.dashboard.subtitle': 'Bienvenido al panel de tu centro de buceo',
    'admin.dashboard.upcomingTrips': 'Próximos Trips',
    'admin.dashboard.pendingBookings': 'Reservas Pendientes',
    'admin.dashboard.confirmedMonth': 'Buzos Confirmados (este mes)',

    'admin.trips.subtitle': 'Gestiona tus salidas de buceo',
    'admin.trips.create': 'Nuevo Trip',
    'admin.trips.edit': 'Editar Trip',
    'admin.trips.empty': 'No hay trips creados aún',
    'admin.trips.created': 'Trip creado exitosamente',
    'admin.trips.updated': 'Trip actualizado',
    'admin.trips.deleted': 'Trip eliminado',
    'admin.trips.confirmDelete': '¿Estás seguro de eliminar este trip?',
    'admin.trips.field.title': 'Título',
    'admin.trips.field.description': 'Descripción',
    'admin.trips.field.diveSite': 'Sitio de Buceo',
    'admin.trips.field.departure': 'Punto de Salida',
    'admin.trips.field.spots': 'Lugares Totales',
    'admin.trips.field.difficulty': 'Dificultad',
    'admin.trips.field.minCert': 'Certificación Mínima',
    'admin.trips.field.status': 'Estado',
    'admin.trips.field.gearRental': 'Alquiler de Equipo',

    'admin.bookings.subtitle': 'Gestiona las reservas de tus trips',
    'admin.bookings.pending': 'Pendientes',
    'admin.bookings.confirmedTab': 'Confirmadas',
    'admin.bookings.rejectedTab': 'Rechazadas',
    'admin.bookings.confirmed': 'Reserva confirmada',
    'admin.bookings.rejected': 'Reserva rechazada',
    'admin.bookings.reject': 'Rechazar',
    'admin.bookings.rejectTitle': 'Rechazar Reserva',
    'admin.bookings.rejectPlaceholder': 'Motivo del rechazo (opcional)',
    'admin.bookings.empty': 'No hay reservas en esta categoría',
    'admin.bookings.noSpots': 'No hay lugares disponibles',

    'admin.staff.subtitle': 'Gestiona el equipo de tu centro',
    'admin.staff.invite': 'Invitar',
    'admin.staff.inviteTitle': 'Invitar Miembro',
    'admin.staff.sendInvite': 'Enviar Invitación',
    'admin.staff.invited': 'Invitación enviada',
    'admin.staff.removed': 'Miembro eliminado',
    'admin.staff.members': 'Miembros del Equipo',
    'admin.staff.empty': 'No hay miembros aún',
    'admin.staff.pendingInvites': 'Invitaciones Pendientes',
    'admin.staff.noInvites': 'No hay invitaciones pendientes',
    'admin.staff.expires': 'Expira',
    'admin.staff.confirmRemove': '¿Eliminar este miembro?',
    'admin.staff.role': 'Rol',

    'admin.settings.subtitle': 'Configura tu centro de buceo',
    'admin.settings.centerInfo': 'Información del Centro',
    'admin.settings.name': 'Nombre del Centro',
    'admin.settings.description': 'Descripción',
    'admin.settings.saved': 'Configuración guardada',

    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.back': 'Volver',
    'common.spots': 'lugares',
    'common.available': 'disponibles',
    'common.price': 'Precio',
    'common.date': 'Fecha',
    'common.time': 'Hora',
  },
  en: {
    // Nav
    'nav.discover': 'Discover',
    'nav.login': 'Log In',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Log Out',
    'nav.myBookings': 'My Bookings',
    'nav.profile': 'Profile',
    'nav.dashboard': 'Dashboard',
    'nav.language': 'ES',

    // Landing
    'landing.hero.title': 'Discover the underwater world',
    'landing.hero.subtitle': 'Plan and book incredible dives at the best destinations in Latin America',
    'landing.hero.cta.diver': 'Explore Dives',
    'landing.hero.cta.center': "I'm a Dive Center",
    'landing.features.title': 'Why Scuba Planner?',
    'landing.features.discover.title': 'Discover Dives',
    'landing.features.discover.desc': 'Find the best dive trips near you with detailed information',
    'landing.features.book.title': 'Easy Booking',
    'landing.features.book.desc': 'Request your spot in one click and coordinate with the dive center',
    'landing.features.connect.title': 'Connect with the Group',
    'landing.features.connect.desc': 'Group chat with confirmed divers and direct WhatsApp communication',
    'landing.features.manage.title': 'Manage Your Center',
    'landing.features.manage.desc': 'Complete panel to manage trips, bookings, and staff',
    'landing.cta.title': 'Ready to dive in?',
    'landing.cta.diver': 'Create Diver Account',
    'landing.cta.center': 'Register My Center',

    // Auth
    'auth.login.title': 'Welcome back',
    'auth.login.subtitle': 'Sign in to continue',
    'auth.signup.title': 'Create your account',
    'auth.signup.subtitle': 'Join the diving community',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login.button': 'Log In',
    'auth.signup.button': 'Sign Up',
    'auth.google': 'Continue with Google',
    'auth.login.link': 'Already have an account? Log in',
    'auth.signup.link': "Don't have an account? Sign up",
    'auth.forgot': 'Forgot your password?',

    // Role Selection
    'role.title': 'How will you use Scuba Planner?',
    'role.diver.title': "I'm a Diver",
    'role.diver.desc': 'I want to discover and book dives',
    'role.center.title': 'Dive Center',
    'role.center.desc': 'I want to manage trips and bookings',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.spots': 'spots',
    'common.available': 'available',
    'common.price': 'Price',
    'common.date': 'Date',
    'common.time': 'Time',
  },
};

export const useI18n = create<I18nStore>((set, get) => ({
  locale: 'es',
  setLocale: (locale) => set({ locale }),
  t: (key: string) => {
    const { locale } = get();
    return translations[locale][key] || key;
  },
}));
