// File: src/app.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase Configuration
const SUPABASE_URL = 'https://wznvgtbastvvkjbphauq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Z6SG8qHcHtpI3dp3DTfGJg_XB5buB2P';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        storage: window.sessionStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

class LLBApp {
    constructor() {
        this.currentUser = null;
        this.currentTenant = null;
        this.userProfile = null;
        this.activeModule = 'module00';
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
                    .insert([{ estate_phase: 'phase_1_living' }])
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
                        role: 'customer', 
                        disclaimer_accepted: false,
                        tenant_id: tenantId
                    }])
                    .select('*, tenants(*)')
                    .single();

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    this.userProfile = { id: this.currentUser.id, role: 'customer', disclaimer_accepted: false };
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
                            <input type="email" id="email" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none text-xs" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Password *</label>
                            <input type="password" id="password" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none text-xs" />
                        </div>
                        <button type="submit" id="submit-btn" class="w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-2 rounded transition text-xs uppercase tracking-wider cursor-pointer">Secure Login</button>
                    </form>
                    <div class="mt-6 text-center border-t border-gray-800 pt-4">
                        <button type="button" id="to-register-btn" class="text-xs text-[#C5A059] hover:underline bg-transparent border-none cursor-pointer font-semibold">Need an account? Open Module 0 Registration</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('to-register-btn').addEventListener('click', () => {
            this.activeModule = 'module00';
            this.renderDashboard();
        });

        document.getElementById('auth-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                alert(error.message);
            } else {
                window.location.reload();
            }
        });
    }

    renderDisclaimerModal() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-6">
                <div class="bg-[#161616] border border-[#C5A059]/30 p-8 rounded-lg max-w-lg w-full shadow-2xl">
                    <h2 class="text-lg font-bold text-[#C5A059] mb-4 uppercase tracking-wider">Legal & UPL Notice</h2>
                    <div class="text-gray-300 text-xs space-y-3 max-h-60 overflow-y-auto mb-6 p-3 bg-[#0E0E0E] rounded border border-gray-800">
                        <p><strong>Notice of Operational Scope:</strong> The LLB platform is a secure enterprise estate workflow and operational system developed and operated by Griffin Property and Holdings LLC (Griffin Consulting).</p>
                        <p><strong>Not Legal Representation:</strong> LLB is an administrative tracking tool and workflow organizer. It does not provide formal legal representation, draft binding testamentary instruments without licensed counsel review, or engage in the unauthorized practice of law (UPL).</p>
                        <p>Users are strongly advised to retain licensed legal counsel to validate all estate, trust, and probate execution documents.</p>
                    </div>
                    <label class="flex items-center space-x-3 mb-6 cursor-pointer">
                        <input type="checkbox" id="accept-disclaimer" class="accent-[#C5A059] w-4 h-4" />
                        <span class="text-xs text-gray-300">I acknowledge and accept these operational terms *</span>
                    </label>
                    <button id="proceed-btn" disabled class="w-full bg-gray-700 text-gray-400 font-bold py-2 rounded transition cursor-not-allowed text-xs uppercase tracking-wider">Proceed to Master Dashboard</button>
                </div>
            </div>
        `;

        const checkbox = document.getElementById('accept-disclaimer');
        const proceedBtn = document.getElementById('proceed-btn');

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                proceedBtn.disabled = false;
                proceedBtn.className = 'w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-2 rounded transition cursor-pointer text-xs uppercase tracking-wider';
            } else {
                proceedBtn.disabled = true;
                proceedBtn.className = 'w-full bg-gray-700 text-gray-400 font-bold py-2 rounded transition cursor-not-allowed text-xs uppercase tracking-wider';
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
                    alert('Error saving acceptance: ' + error.message);
                    return;
                }
            }
            window.location.reload();
        });
    }

    renderDashboard() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-[#0E0E0E] text-gray-100 flex">
                <aside class="w-64 bg-[#161616] border-r border-[#C5A059]/20 p-4 flex flex-col justify-between">
                    <div>
                        <div class="mb-6 flex items-center space-x-3">
                            <img src="./LLB.jpeg" alt="LLB Logo" class="h-8 w-auto rounded border border-[#C5A059]/30 object-contain">
                            <div>
                                <span class="text-[#C5A059] font-bold text-sm tracking-wider">ESTATE ERP</span>
                                <p class="text-[10px] text-gray-400">Role: ${this.userProfile?.role || 'Customer'}</p>
                            </div>
                        </div>
                        <nav id="module-nav" class="space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] text-xs">
                            <!-- Populated dynamically -->
                        </nav>
                    </div>
                    <button id="logout-btn" class="w-full bg-red-900/40 hover:bg-red-900/60 text-red-200 py-2 rounded text-xs transition border border-red-700/50 cursor-pointer">Sign Out</button>
                </aside>
                <main class="flex-1 p-8 overflow-y-auto">
                    <div id="module-container" class="bg-[#161616] border border-[#C5A059]/20 p-6 rounded-lg min-h-[80vh]">
                        <!-- Module content renders here -->
                    </div>
                </main>
            </div>
        `;

        this.renderNavigation();
        this.loadModule(this.activeModule);

        document.getElementById('logout-btn').addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.reload();
        });
    }

    renderNavigation() {
        const modules = [
            { id: 'module00', label: 'Module 0: Onboarding' },
            { id: 'module01', label: 'Module 1: Vitals & Contacts' },
            { id: 'module02', label: 'Module 2: Parents' },
            { id: 'module03', label: 'Module 3: Education' },
            { id: 'module04', label: 'Module 4: Employment' },
            { id: 'module05', label: 'Module 5: Civic' },
            { id: 'module06', label: 'Module 6: Faith' },
            { id: 'module07', label: 'Module
