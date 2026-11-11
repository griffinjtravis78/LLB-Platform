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
        this.activeSubLevel = null;
        this.openAccordionModule = null;
        this.initInactivityTimer();
    }

    initInactivityTimer() {
        let timeout;
        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (this.currentUser) {
                    supabase.auth.signOut();
                    alert("Session expired due to 15 minutes of inactivity.");
                    window.location.reload();
                }
            }, 15 * 60 * 1000);
        };
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keypress', resetTimer);
        resetTimer();
    }

    async init() {
        try {
            const appElement = document.getElementById('app');
            if (!appElement) return;

            appElement.innerHTML = `
                <div class="min-h-[60vh] flex items-center justify-center">
                    <div class="text-xs text-[#D8C3A5] font-mono animate-pulse uppercase tracking-widest">Loading LLB Platform...</div>
                </div>
            `;

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
            } else if ((this.userProfile?.access_tier || 0) === 0) {
                this.renderTierSelection();
            } else {
                this.renderDashboard();
            }
        } catch (err) {
            console.error('Initialization error:', err);
            const appContainer = document.getElementById('app');
            if (appContainer) {
                appContainer.innerHTML = `
                    <div class="min-h-[60vh] text-red-300 flex items-center justify-center p-6 text-center">
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
            let { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (profileError || !profileData) {
                // Self-healing: auto-provision missing profile row
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: this.currentUser.id,
                        role: 'customer',
                        access_tier: 1,
                        disclaimer_accepted: false
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('Profile auto-provision error:', insertError.message);
                    this.userProfile = { id: this.currentUser.id, role: 'customer', access_tier: 1, disclaimer_accepted: false };
                } else {
                    this.userProfile = newProfile;
                }
                this.currentTenant = null;
            } else {
                this.userProfile = profileData;
                
                if (profileData.tenant_id) {
                    let { data: tenantData } = await supabase
                        .from('tenants')
                        .select('*')
                        .eq('id', profileData.tenant_id)
                        .single();
                    
                    this.currentTenant = tenantData || null;
                }
            }
        } catch (err) {
            console.error('Error in loadOrCreateUserProfile:', err);
        }
    }

    renderLogin() {
        document.getElementById('app').innerHTML = `
            <div class="flex flex-col items-center justify-center py-8 px-4">
                <div class="text-center mb-6">
                    <img src="./LLB.jpeg" alt="LLB Logo" class="h-24 w-auto mx-auto rounded-xl border-2 border-[#D8C3A5]/50 object-contain bg-white p-2 shadow-xl mb-3">
                    <h1 class="text-2xl font-bold text-[#D8C3A5] tracking-widest uppercase">LLB Platform</h1>
                    <p class="text-xs text-gray-300 mt-1">Life, Legacy, and Bereavement Enterprise ERP</p>
                </div>

                <div class="bg-[#485664] border border-[#D8C3A5]/40 p-8 rounded-xl max-w-md w-full shadow-2xl">
                    <div class="text-center mb-6">
                        <h2 class="text-lg font-bold text-[#D8C3A5] tracking-wider">SECURE LOGIN</h2>
                        <p class="text-gray-300 text-xs mt-1">Enter your credentials to access your estate workspace</p>
                    </div>
                    <form id="auth-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Email Address *</label>
                            <input type="email" id="email" required class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2.5 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Password *</label>
                            <input type="password" id="password" required class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2.5 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                        </div>
                        <button type="submit" id="submit-btn" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-3 rounded transition text-xs uppercase tracking-wider cursor-pointer shadow">Secure Login</button>
                    </form>
                    <div class="mt-6 text-center border-t border-[#6A7B8C] pt-4">
                        <button type="button" id="to-register-btn" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">Need an account? Open Level 0 Registration</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('to-register-btn').addEventListener('click', () => {
            const container = document.getElementById('app');
            import('./modules/module00.js').then(mod => {
                if (typeof mod.renderModule00 === 'function') {
                    mod.renderModule00(container);
                }
            });
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
            <div class="flex items-center justify-center py-12 px-4">
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
                    <button id="proceed-btn" disabled class="w-full bg-[#6A7B8C] text-gray-300 font-bold py-2 rounded transition cursor-not-allowed text-xs uppercase tracking-wider">Proceed to Service Tier Selection</button>
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
                    alert('Error saving acceptance: ' + error.message);
                    return;
                }
            }
            window.location.reload();
        });
    }

    renderTierSelection() {
        document.getElementById('app').innerHTML = `
            <div class="max-w-6xl mx-auto py-10 px-4 text-gray-100">
                <div class="text-center mb-10">
                    <h1 class="text-2xl font-bold text-[#D8C3A5] tracking-widest uppercase">Select Your Service Tier</h1>
                    <p class="text-xs text-gray-300 mt-2">Choose the track that fits your storage needs, estate complexity, and level of guidance.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-[#485664] border border-[#D8C3A5]/40 p-6 rounded-xl shadow-xl flex flex-col justify-between">
                        <div>
                            <span class="text-[10px] uppercase tracking-widest text-[#D8C3A5] font-mono">The "Starter" Track</span>
                            <h3 class="text-lg font-bold text-white mt-1">Essential Legacy</h3>
                            <div class="my-4 pb-4 border-b border-[#6A7B8C]">
                                <span class="text-2xl font-bold text-[#D8C3A5]">$49</span> <span class="text-xs text-gray-300">setup + $3.99/mo</span>
                            </div>
                        </div>
                        <button data-tier="1" class="tier-select-btn w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-3 rounded transition text-xs uppercase tracking-wider cursor-pointer shadow">Select Essential</button>
                    </div>
                    <div class="bg-[#485664] border-2 border-[#D8C3A5] p-6 rounded-xl shadow-2xl flex flex-col justify-between relative">
                        <div>
                            <span class="text-[10px] uppercase tracking-widest text-[#D8C3A5] font-mono">The "Professional" Track</span>
                            <h3 class="text-lg font-bold text-white mt-1">Comprehensive Estate</h3>
                            <div class="my-4 pb-4 border-b border-[#6A7B8C]">
                                <span class="text-2xl font-bold text-[#D8C3A5]">$149</span> <span class="text-xs text-gray-300">setup + $7.99/mo</span>
                            </div>
                        </div>
                        <button data-tier="2" class="tier-select-btn w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-3 rounded transition text-xs uppercase tracking-wider cursor-pointer shadow">Select Comprehensive</button>
                    </div>
                    <div class="bg-[#485664] border border-[#D8C3A5]/40 p-6 rounded-xl shadow-xl flex flex-col justify-between">
                        <div>
                            <span class="text-[10px] uppercase tracking-widest text-[#D8C3A5] font-mono">The "Master" Track</span>
                            <h3 class="text-lg font-bold text-white mt-1">Enterprise Heritage & Dynasty</h3>
                            <div class="my-4 pb-4 border-b border-[#6A7B8C]">
                                <span class="text-2xl font-bold text-[#D8C3A5]">$399</span> <span class="text-xs text-gray-300">setup + $19.99/mo</span>
                            </div>
                        </div>
                        <button data-tier="3" class="tier-select-btn w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-3 rounded transition text-xs uppercase tracking-wider cursor-pointer shadow">Select Enterprise</button>
                    </div>
                </div>
            </div>
        `;

        document.querySelectorAll('.tier-select-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tierLevel = parseInt(e.target.getAttribute('data-tier'));
                const { error } = await supabase
                    .from('profiles')
                    .update({ access_tier: tierLevel })
                    .eq('id', this.currentUser.id);

                if (error) {
                    alert('Error saving tier selection: ' + error.message);
                    return;
                }
                window.location.reload();
            });
        });
    }

    renderDashboard() {
        document.getElementById('app').innerHTML = `
            <div class="text-gray-100 flex min-h-[85vh]">
                <aside class="w-72 bg-[#485664] border-r border-[#D8C3A5]/20 p-4 flex flex-col justify-between shadow-lg rounded-l-lg">
                    <div>
                        <div class="mb-4 pb-3 border-b border-[#D8C3A5]/20">
                            <span class="text-[#D8C3A5] font-bold text-xs tracking-wider uppercase">Workspace Modules</span>
                            <p class="text-[10px] text-gray-300 mt-0.5">Role: ${this.userProfile?.role || 'Customer'}</p>
                            <p class="text-[10px] text-amber-300 mt-0.5 font-mono">Tier: Level ${this.userProfile?.access_tier || 1}</p>
                        </div>
                        <nav id="module-nav" class="space-y-1.5 overflow-y-auto max-h-[calc(100vh-240px)] text-xs">
                            <!-- Populated dynamically -->
                        </nav>
                    </div>
                    <button id="logout-btn" class="w-full bg-red-900/60 hover:bg-red-900 text-red-100 py-2 rounded text-xs transition border border-red-700/50 cursor-pointer mt-4">Sign Out</button>
                </aside>
                <main class="flex-1 p-6 overflow-y-auto bg-[#485664]/40 rounded-r-lg">
                    <div id="module-container" class="bg-[#485664] border border-[#D8C3A5]/30 p-6 rounded-lg min-h-[75vh] shadow-xl"></div>
                </main>
            </div>
        `;

        this.renderNavigation();

        // Load role-based dashboard view by default, or specific module if active
        if (this.activeModule === 'module00' && !this.activeSubLevel) {
            import('./components/roleDashboards.js').then(async (mod) => {
                const container = document.getElementById('module-container');
                if (typeof mod.renderRoleDashboard === 'function') {
                    await mod.renderRoleDashboard(container, this.userProfile, this.currentTenant);
                }
            });
        } else {
            this.loadModule(this.activeModule, this.activeSubLevel);
        }

        document.getElementById('logout-btn').addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.reload();
        });
    }

    renderNavigation() {
        const userTier = this.userProfile?.access_tier || 1;

        const modules = [
            { id: 'module00', label: 'Module 0: Onboarding', minTier: 1, subLevels: [{ id: '0.1', label: '0.1 Credentials & Profile' }] },
            { id: 'module01', label: 'Module 1: Vitals & Contacts', minTier: 1, subLevels: [{ id: '1.1', label: '1.1 Biographical Vitals' }, { id: '1.2', label: '1.2 Professional Counsel' }] },
            { id: 'module02', label: 'Module 2: Parental History', minTier: 1, subLevels: [{ id: '2.1', label: '2.1 Lineage Records' }] },
            { id: 'module03', label: 'Module 3: Education', minTier: 1, subLevels: [{ id: '3.1', label: '3.1 Degrees & Institutions' }] },
            { id: 'module04', label: 'Module 4: Employment', minTier: 1, subLevels: [{ id: '4.1', label: '4.1 Work History & Pensions' }] },
            { id: 'module05', label: 'Module 5: Civic', minTier: 1, subLevels: [{ id: '5.1', label: '5.1 Memberships & Volunteer' }] },
            { id: 'module06', label: 'Module 6: Faith', minTier: 1, subLevels: [{ id: '6.1', label: '6.1 Religious Community' }] },
            { id: 'module07', label: 'Module 7: Military', minTier: 2, subLevels: [{ id: '7.1', label: '7.1 DD-214 & Honors' }] },
            { id: 'module08', label: 'Module 8: Cultural', minTier: 2, subLevels: [{ id: '8.1', label: '8.1 Tribal & Traditional Rites' }] },
            { id: 'module09', label: 'Module 9: Disposition', minTier: 2, subLevels: [{ id: '9.1', label: '9.1 Mortuary Contracts' }] },
            { id: 'module10', label: 'Module 10: Aesthetics', minTier: 2, subLevels: [{ id: '10.1', label: '10.1 Burial Attire & Floral' }] },
            { id: 'module11', label: 'Module 11: Participants', minTier: 2, subLevels: [{ id: '11.1', label: '11.1 Ceremonial Roles' }] },
            { id: 'module12', label: 'Module 12: Photos', minTier: 3, subLevels: [{ id: '12.1', label: '12.1 Photo Vault & C2PA' }] },
            { id: 'module13', label: 'Module 13: Stories', minTier: 3, subLevels: [{ id: '13.1', label: '13.1 Historical Narratives' }] },
            { id: 'module14', label: 'Module 14: Itineraries', minTier: 3, subLevels: [{ id: '14.1', label: '14.1 Service Schedules' }] },
            { id: 'module15', label: 'Module 15: Financial Assets', minTier: 3, subLevels: [
                { id: '15.1', label: '15.1 Real Estate & Deeds' },
                { id: '15.2', label: '15.2 Vehicles & Titles' },
                { id: '15.3', label: '15.3 Digital Vaults' },
                { id: '15.4', label: '15.4 Physical Valuables' },
                { id: '15.5', label: '15.5 Business Entities' },
                { id: '15.6', label: '15.6 Investments & Securities' }
            ]},
            { id: 'module16', label: 'Module 1
