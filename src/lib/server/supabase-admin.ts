import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

// Cliente con rol de servicio: no aplica RLS. Uso exclusivo desde código de
// servidor (endpoints de administración, validación del guardia, reportes).
// No importar nunca este módulo desde código que se ejecute en el navegador.
export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: { autoRefreshToken: false, persistSession: false }
});
