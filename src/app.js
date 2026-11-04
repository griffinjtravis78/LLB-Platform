import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase Configuration with explicit session handling
const SUPABASE_URL = 'https://wznvgtbastvvkjbphauq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Z6SG8qHcHtpI3dp3DTfGJg_XB5buB2P';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

class LLBApp {
    constructor() {
        this.currentUser = null;
        this.currentTenant = null;
        this.userProfile = null;
        this.activeModule = 'onboarding';
        this.initInactivityTimer();
    }

    async init() {
        try {
            const appElement = document.getElementById('app');
            if (!appElement) {
                console.error("Critical: #app element missing from DOM.");
                return;
            }

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            
            this.currentUser = session?.user || null;

            if (!this.currentUser) {
                this.renderLogin();
                return;
            }

            await this.loadOrCreateUserProfile();
            
            if (!this.userProfile || !this.userProfile.disclaimer_accepted) {
                this.renderDisclaimerModal();
            } else {
                this.renderDashboard();
            }
        } catch (err) {
            console.error('Initialization error:', err);
            const appContainer = document.getElementById('app');
            if (appContainer) {
                appContainer.innerHTML = `
                    <div class="min-h-screen bg-[#0E0E0E] text-red-400 flex items-center justify-center p-6 text-center">
                        <div class="bg-[#161616] border border-red-900/50 p-6 rounded-lg max-w-md">
                            <h3 class="font-bold text-sm mb-2 uppercase tracking-widest">Initialization Error</h3>
                            <p class="text-xs text-gray-300">${err.message}</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    async loadOrCreateUserProfile() {
        try {
            let { data, error } = await supabase
                .from('profiles')
                .select('*, tenants(*)')
                .eq('id', this.currentUser.id)
                .single();

            if (error || !data) {
                console.log('No profile found. Automatically provisioning profile and tenant...');
                
                const { data: tenantData, error: tenantError } = await supabase
                    .from('tenants')
                    .insert([{ name: `${this.currentUser.email.split('@')[0]}'s Estate` }])
                    .select()
                    .single();

                if (tenantError) {
                    console.error('Error creating tenant:', tenantError);
                }

                const tenantId = tenantData ? tenantData.id : null;

                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .upsert([{ 
                        id: this.currentUser.id, 
                        role: 'admin', 
                        disclaimer_accepted: false,
                        tenant_id: tenantId
                    }])
                    .select('*, tenants(*)')
                    .single();

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    this.userProfile = { id: this.currentUser.id, role: 'admin', disclaimer_accepted: false };
                    this.currentTenant = null;
                } else {
                    this.userProfile = profileData;
                    this.currentTenant = profileData.tenants;
                }
            } else {
                this.userProfile = data;
                this.currentTenant = data.tenants;
            }
        } catch (err) {
            console.error('Error in loadOrCreateUserProfile:', err);
        }
    }

    renderLogin() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-6">
                <div class="bg-[#161616] border border-[#C5A059]/30 p-8 rounded-lg max-w-md w-full shadow-2xl">
                    <div class="text-center mb-6">
                        <span class="text-[#C5A059] text-2xl font-bold tracking-widest">LLB ERP</span>
                        <p class="text-gray-400 text-sm mt-1">Life, Legacy, and Bereavement</p>
                    </div>
                    <form id="auth-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Email Address *</label>
                            <input type="email" id="email" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Password *</label>
                            <input type="password" id="password" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                        </div>
                        <button type="submit" id="submit-btn" class="w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-2 rounded transition">Secure Login</button>
                    </form>
                    <div class="mt-6 text-center border-t border-gray-800 pt-4">
                        <button type="button" id="toggle-mode" class="text-xs text-[#C5A059] hover:underline bg-transparent border-none cursor-pointer font-semibold">Need an account? Register here</button>
                    </div>
                </div>
            </div>
        `;

        let isRegistering = false;
        document.getElementById('toggle-mode').addEventListener('click', () => {
            isRegistering = !isRegistering;
            document.getElementById('submit-btn').textContent = isRegistering ? 'Create Account' : 'Secure Login';
            document.getElementById('toggle-mode').textContent = isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register here';
        });

        document.getElementById('auth-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (isRegistering) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) {
                    alert(error.message);
                } else {
                    alert('Registration successful! You can now log in.');
                    window.location.reload();
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) alert(error.message);
                else window.location.reload();
            }
        });
    }

    renderDisclaimerModal() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-6">
                <div class="bg-[#161616] border border-[#C5A059]/30 p-8 rounded-lg max-w-lg w-full shadow-2xl">
                    <h2 class="text-lg font-bold text-[#C5A059] mb-4">Legal & UPL Notice</h2>
                    <div class="text-gray-300 text-xs space-y-3 max-h-60 overflow-y-auto mb-6 p-3 bg-[#0E0E0E] rounded border border-gray-800">
                        <p><strong>Notice of Operational Scope:</strong> The LLB platform is a secure enterprise estate workflow and operational system developed and operated by Griffin Property and Holdings LLC (Griffin Consulting).</p>
                        <p><strong>Not Legal Representation:</strong> LLB is an administrative tracking tool and workflow organizer. It does not provide formal legal representation, draft binding testamentary instruments without licensed counsel review, or engage in the unauthorized practice of law (UPL).</p>
                        <p>Users are strongly advised to retain licensed legal counsel to validate all estate, trust, and probate execution documents.</p>
                    </div>
                    <label class="flex items-center space-x-3 mb-6 cursor-pointer">
                        <input type="checkbox" id="accept-disclaimer" class="accent-[#C5A059] w-4 h-4" />
                        <span class="text-xs text-gray-300">I acknowledge and accept these operational terms *</span>
                    </label>
                    <button id="proceed-btn" disabled class="w-full bg-gray-700 text-gray-400 font-bold py-2 rounded transition cursor-not-allowed">Proceed to Master Dashboard</button>
                </div>
            </div>
        `;

        const checkbox = document.getElementById('accept-disclaimer');
        const proceedBtn = document.getElementById('proceed-btn');

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                proceedBtn.disabled = false;
                proceedBtn.className = 'w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-2 rounded transition cursor-pointer';
            } else {
                proceedBtn.disabled = true;
                proceedBtn.className = 'w-full bg-gray-700 text-gray-400 font-bold py-2 rounded transition cursor-not-allowed';
            }
        });

        proceedBtn.addEventListener('click', async () => {
            if (!checkbox.checked) return;
            
            if (this.currentUser?.id) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ disclaimer_accepted: true })
                    .eq('id', this.currentUser.id);

                if (error) {
                    console.error('Error saving disclaimer acceptance:', error);
                    alert('Error saving
