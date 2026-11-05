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
                    <div class="min-h-screen bg-[#2C353D] text-red-300 flex items-center justify-center p-6 text-center">
                        <div class="bg-[#485664] border border-red-900/50 p-6 rounded-lg max-w-md shadow-xl">
                            <h3 class="font-bold text-sm mb-2 uppercase tracking-widest text-[#D8C3A5]">Initialization Error</h3>
                            <p class="text-xs text-gray-200">${err.message}</p>
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
            <div class="min-h-screen bg-[#2C353D] flex items-center justify-center p-6">
                <div class="bg-[#485664] border border-[#D8C3A5]/40 p-8 rounded-lg max-w-md w-full shadow-2xl">
                    <div class="text-center mb-6">
                        <span class="text-[#D8C3A5] text-2xl font-bold tracking-widest">LLB ERP</span>
                        <p class="text-gray-300 text-sm mt-1">Life, Legacy, and Bereavement</p>
                    </div>
                    <form id="auth-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Email Address *</label>
                            <input type="email" id="email" required class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Password *</label>
                            <input type="password" id="password" required class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                        </div>
                        <button type="submit" id="submit-btn" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2 rounded transition text-xs uppercase tracking-wider cursor-pointer shadow">Secure Login</button>
                    </form>
                    <div class="mt-6 text-center border-t border-[#6A7B8C] pt-4">
                        <button type="button" id="to-register-btn" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">Need an account? Open Module 0 Registration</button>
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
            <div class="min-h-screen bg-[#2C353D] flex items-center justify-center p-6">
                <div class="bg-[#485664] border border-[#D8C3A5]/40 p-8 rounded-lg max-w-lg w-full shadow-2xl">
                    <h2 class="text-lg font-bold text-[#D8C3A5] mb-4 uppercase tracking-wider">Legal & UPL Notice</h2>
                    <div class="text-gray-200 text-xs space-y-3 max-h-60 overflow-y-auto mb-6 p-3 bg-[#2C353D] rounded border border-[#6A7B8C]">
                        <p><strong>Notice of Operational Scope:</strong> The LLB platform is a secure enterprise estate workflow and operational system developed and operated by Griffin Property and Holdings LLC (Griffin Consulting).</p>
                        <p><strong>Not Legal Representation:</strong> LLB is an administrative tracking tool and workflow organizer. It does not provide formal legal representation, draft binding testamentary instruments without licensed counsel review, or engage in the unauthorized practice of law (UPL).</p>
                        <p>Users are strongly advised to retain licensed legal counsel to validate all estate, trust, and probate execution documents.</p>
                    </div>
                    <label class="flex items-center space-x-3 mb-6 cursor-pointer">
                        <input type="checkbox" id="accept-disclaimer" class="accent-[#D8C3A5] w-4 h-4" />
                        <span class="text-xs text-gray-200">I acknowledge and accept these operational terms *</span>
                    </label>
                    <button id="proceed-btn" disabled class="w-full bg-[#6A7B8C] text-gray-300 font-bold py-2 rounded transition cursor-not-allowed text-xs uppercase tracking-wider">Proceed to Master Dashboard</button>
                </div>
            </div>
        `;

        const checkbox = document.getElementById('accept-disclaimer');
        const proceedBtn = document.getElementById('proceed-btn');

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                proceedBtn.disabled = false;
                proceedBtn.className = 'w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow';
            } else {
                proceedBtn.disabled = true;
                proceedBtn.className = 'w-full bg-[#6A7B8C] text-gray-300 font-bold py-2 rounded transition cursor-not-allowed text-xs uppercase tracking-wider';
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
            <div class="min-h-screen bg-[#2C353D] text-gray-100 flex">
                <aside class="w-64 bg-[#485664] border-r border-[#D8C3A5]/20 p-4 flex flex-col justify-between shadow-lg">
                    <div>
                        <div class="mb-6 flex items-center space-x-3">
                            <img src="./LLB.jpeg" alt="LLB Logo" class="h-8 w-auto rounded border border-[#D8C3A5]/30 object-contain bg-white p-1">
                            <div>
                                <span class="text-[#D8C3A5] font-bold text-sm tracking-wider">ESTATE ERP</span>
                                <p class="text-[10px] text-gray-300">Role: ${this.userProfile?.role || 'Customer'}</p>
                            </div>
                        </div>
                        <nav id="module-nav" class="space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] text-xs">
                            <!-- Populated dynamically -->
                        </nav>
                    </div>
                    <button id="logout-btn" class="w-full bg-red-900/60 hover:bg-red-900 text-red-100 py-2 rounded text-xs transition border border-red-700/50 cursor-pointer">Sign Out</button>
                </aside>
                <main class="flex-1 p-8 overflow-y-auto">
                    <div id="module-container" class="bg-[#485664] border border-[#D8C3A5]/30 p-6 rounded-lg min-h-[80vh] shadow-xl">
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
            { id: 'module07', label: 'Module 7: Military' },
            { id: 'module08', label: 'Module 8: Cultural' },
            { id: 'module09', label: 'Module 9: Disposition' },
            { id: 'module10', label: 'Module 10: Aesthetics' },
            { id: 'module11', label: 'Module 11: Participants' },
            { id: 'module12', label: 'Module 12: Photos' },
            { id: 'module13', label: 'Module 13: Stories' },
            { id: 'module14', label: 'Module 14: Itineraries' },
            { id: 'module15', label: 'Module 15: Financial' },
            { id: 'module16', label: 'Module 16: Insurance' },
            { id: 'module17', label: 'Module 17: Utilities' },
            { id: 'module18', label: 'Module 18: Storage' }
        ];

        const navHtml = modules.map(m => `
            <button data-module="${m.id}" class="w-full text-left px-3 py-2 rounded transition ${this.activeModule === m.id ? 'bg-[#D8C3A5] text-[#2C353D] font-bold shadow' : 'text-gray-200 hover:bg-[#6A7B8C] hover:text-[#D8C3A5]'} cursor-pointer">
                ${m.label}
            </button>
        `).join('');

        document.getElementById('module-nav').innerHTML = navHtml;

        document.querySelectorAll('#module-nav button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.activeModule = e.target.getAttribute('data-module');
                this.renderNavigation();
                this.loadModule(this.activeModule);
            });
        });
    }

    async loadModule(moduleId) {
        const container = document.getElementById('module-container');
        container.innerHTML = `<div class="text-xs text-[#D8C3A5] font-mono animate-pulse">Loading module component...</div>`;
        
        try {
            const modNum = moduleId.replace('module', '');
            const mod = await import(`./modules/module${modNum}.js`);
            
            if (typeof mod[`renderModule${modNum}`] === 'function') {
                await mod[`renderModule${modNum}`](container);
            } else if (typeof mod.render === 'function') {
                await mod.render(container);
            } else {
                throw new Error(`Module render function not found for ${moduleId}`);
            }
        } catch (err) {
            console.error(`Failed to load module ${moduleId}:`, err);
            container.innerHTML = `
                <div class="space-y-4">
                    <h3 class="text-lg font-bold text-[#D8C3A5] uppercase tracking-wider">${moduleId.toUpperCase()}</h3>
                    <p class="text-xs text-gray-300">Master schema data binding and module interface.</p>
                    <div class="p-4 bg-[#2C353D] rounded border border-[#6A7B8C] text-xs text-gray-200 space-y-2 font-mono">
                        <p class="text-amber-300">Note: External module script file pending or path mismatch (${err.message}).</p>
                        <p><strong>Tenant ID:</strong> ${this.currentTenant?.id || 'Unlinked'}</p>
                        <p><strong>Active Role:</strong> ${this.userProfile?.role || 'Customer'}</p>
                    </div>
                </div>
            `;
        }
    }

    initInactivityTimer() {
        let inactivityTimer;
        const TIMEOUT_DURATION = 15 * 60 * 1000;

        const resetTimer = async () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await supabase.auth.signOut();
                    alert('Session expired due to inactivity.');
                    window.location.reload();
                }
            }, TIMEOUT_DURATION);
        };

        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            window.addEventListener(event, resetTimer, true);
        });
        resetTimer();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new LLBApp();
    app.init();
});
