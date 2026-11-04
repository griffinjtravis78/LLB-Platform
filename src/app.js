import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { renderModule00 } from './modules/module00.js';
import { renderModule01 } from './modules/module01.js';
import { renderModule02 } from './modules/module02.js';
import { renderModule03 } from './modules/module03.js';
import { renderModule04 } from './modules/module04.js';
import { renderModule05 } from './modules/module05.js';
import { renderModule06 } from './modules/module06.js';
import { renderModule07 } from './modules/module07.js';
import { renderModule08 } from './modules/module08.js';
import { renderModule09 } from './modules/module09.js';
import { renderModule10 } from './modules/module10.js';
import { renderModule11 } from './modules/module11.js';
import { renderModule12 } from './modules/module12.js';
import { renderModule13 } from './modules/module13.js';
import { renderModule14 } from './modules/module14.js';
import { renderModule15 } from './modules/module15.js';
import { renderModule16 } from './modules/module16.js';
import { renderModule17 } from './modules/module17.js';
import { renderModule18 } from './modules/module18.js';
import { renderAuditLedger } from './components/auditLedger.js';
import { renderLegalDisclaimerModal } from './components/legalDisclaimer.js';
import { renderPhaseGateway } from './components/phaseGateway.js';

const SUPABASE_URL = 'https://wznvgtbastvvkjbphauq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Z6SG8qHcHtpI3dp3DTfGJg_XB5buB2P';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class LLBRouter {
    constructor() {
        this.init();
    }

    async init() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            this.renderLogin();
        } else {
            renderLegalDisclaimerModal(() => this.renderDashboard(session));
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
                    <form id="login-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Email Address *</label>
                            <input type="email" id="email" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Password *</label>
                            <input type="password" id="password" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                        </div>
                        <button type="submit" class="w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-2 rounded transition">Secure Login</button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) alert(error.message);
            else window.location.reload();
        });
    }

    renderDashboard(session) {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-[#0E0E0E] text-white flex">
                <aside class="w-64 bg-[#161616] border-r border-gray-800 p-4 flex flex-col justify-between overflow-y-auto">
                    <div>
                        <div class="flex items-center gap-2 mb-8 px-2">
                            <div class="w-8 h-8 rounded bg-[#C5A059] flex items-center justify-center font-bold text-[#0E0E0E]">LLB</div>
                            <span class="font-bold tracking-wider text-[#C5A059]">ESTATE ERP</span>
                        </div>
                        <nav class="space-y-1 text-sm">
                            <button id="nav-mod-00" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 0: Onboarding *</button>
                            <button id="nav-mod-01" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 1: Vitals & Contacts *</button>
                            <button id="nav-mod-02" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 2: Real Estate *</button>
                            <button id="nav-mod-03" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 3: Digital Assets *</button>
                            <button id="nav-mod-04" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 4: Physical Valuables *</button>
                            <button id="nav-mod-05" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 5: Vehicles & Titles *</button>
                            <button id="nav-mod-06" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 6: Intellectual Property *</button>
                            <button id="nav-mod-07" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 7: Business Interests *</button>
                            <button id="nav-mod-08" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 8: Investments *</button>
                            <button id="nav-mod-09" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 9: Mortuary Hub *</button>
                            <button id="nav-mod-10" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 10: Fiduciaries & POA *</button>
                            <button id="nav-mod-11" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 11: Pet Care *</button>
                            <button id="nav-mod-12" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 12: Charities *</button>
                            <button id="nav-mod-13" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 13: Liabilities *</button>
                            <button id="nav-mod-14" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 14: Tax & Govt Records *</button>
                            <button id="nav-mod-15" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 15: Financial Assets *</button>
                            <button id="nav-mod-16" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 16: Insurance & Policies *</button>
                            <button id="nav-mod-17" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 17: Final Wishes *</button>
                            <button id="nav-mod-18" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Module 18: Safe Deposit Boxes *</button>
                            
                            <div class="pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Governance</div>
                            <button id="nav-phase" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-red-400 transition font-semibold">Phase Gateway (Bereavement)</button>
                            <button id="nav-audit" class="w-full text-left px-3 py-2 rounded hover:bg-[#0E0E0E] text-gray-300 hover:text-[#C5A059] transition">Audit & Transaction Log</button>
                        </nav>
                    </div>
                    <div class="border-t border-gray-800 pt-4 text-xs text-gray-500">
                        Authenticated: ${session.user.email}
                    </div>
                </aside>
                <main class="flex-1 p-8 overflow-y-auto">
                    <header class="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                        <h1 class="text-xl font-semibold text-[#C5A059] tracking-wide">Master Tenant Dashboard</h1>
                        <span class="text-xs px-3 py-1 bg-[#161616] border border-[#C5A059]/30 rounded text-[#C5A059]">Phase 1: Living</span>
                    </header>
                    <div id="module-container" class="bg-[#161616] border border-gray-800 rounded-lg p-6">
                        <p class="text-gray-400">Select a module from the navigation panel to load records.</p>
                    </div>
                </main>
            </div>
        `;

        document.getElementById('nav-mod-00').addEventListener('click', () => renderModule00(document.getElementById('module-container')));
        document.getElementById('nav-mod-01').addEventListener('click', () => renderModule01(document.getElementById('module-container')));
        document.getElementById('nav-mod-02').addEventListener('click', () => renderModule02(document.getElementById('module-container')));
        document.getElementById('nav-mod-03').addEventListener('click', () => renderModule03(document.getElementById('module-container')));
        document.getElementById('nav-mod-04').addEventListener('click', () => renderModule04(document.getElementById('module-container')));
        document.getElementById('nav-mod-05').addEventListener('click', () => renderModule05(document.getElementById('module-container')));
        document.getElementById('nav-mod-06').addEventListener('click', () => renderModule06(document.getElementById('module-container')));
        document.getElementById('nav-mod-07').addEventListener('click', () => renderModule07(document.getElementById('module-container')));
        document.getElementById('nav-mod-08').addEventListener('click', () => renderModule08(document.getElementById('module-container')));
        document.getElementById('nav-mod-09').addEventListener('click', () => renderModule09(document.getElementById('module-container')));
        document.getElementById('nav-mod-10').addEventListener('click', () => renderModule10(document.getElementById('module-container')));
        document.getElementById('nav-mod-11').addEventListener('click', () => renderModule11(document.getElementById('module-container')));
        document.getElementById('nav-mod-12').addEventListener('click', () => renderModule12(document.getElementById('module-container')));
        document.getElementById('nav-mod-13').addEventListener('click', () => renderModule13(document.getElementById('module-container')));
        document.getElementById('nav-mod-14').addEventListener('click', () => renderModule14(document.getElementById('module-container')));
        document.getElementById('nav-mod-15').addEventListener('click', () => renderModule15(document.getElementById('module-container')));
        document.getElementById('nav-mod-16').addEventListener('click', () => renderModule16(document.getElementById('module-container')));
        document.getElementById('nav-mod-17').addEventListener('click', () => renderModule17(document.getElementById('module-container')));
        document.getElementById('nav-mod-18').addEventListener('click', () => renderModule18(document.getElementById('module-container')));
        document.getElementById('nav-phase').addEventListener('click', () => renderPhaseGateway(document.getElementById('module-container'), () => this.init()));
        document.getElementById('nav-audit').addEventListener('click', () => renderAuditLedger(document.getElementById('module-container')));
    }
}

window.addEventListener('DOMContentLoaded', () => new LLBRouter());
