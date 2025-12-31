/**
 * Represents a link definition with URL and metadata
 */
export interface LinkDefinition {
    /** The URL to link to */
    url: string

    /** Whether the link is internal (relative to baseUrl) or external */
    internal: boolean

    /** Optional title attribute for the link */
    title?: string

    /** Whether the term matching should be case-sensitive (default: false) */
    caseSensitive?: boolean

    /** Whether to match whole words only (default: true) */
    wholeWord?: boolean
}

/**
 * Type for the link mappings record
 */
export type LinkMappings = Record<string, LinkDefinition>;

export const LINK_MAPPINGS: LinkMappings = {
    Cyberpath: {
        url:      `/`,
        internal: true,
        title:    `CyberPath - Cybersecurity Tools & Resources`,
    },
    CyberPath: {
        url:      `/`,
        internal: true,
        title:    `CyberPath - Cybersecurity Tools & Resources`,
    },
    CertDb: {
        url:      `https://certdb.cyberpath-hq.com/`,
        internal: false,
        title:    `CertDb - Cybersecurity Certification Database`,
    },
    "certification database": {
        url:      `https://certdb.cyberpath-hq.com/`,
        internal: false,
        title:    `CertDb - Cybersecurity Certification Database`,
    },
    "certifications database": {
        url:      `https://certdb.cyberpath-hq.com/`,
        internal: false,
        title:    `CertDb - Cybersecurity Certification Database`,
    },
    "cybersecurity certifications": {
        url:      `https://certdb.cyberpath-hq.com/`,
        internal: false,
        title:    `CertDb - Cybersecurity Certification Database`,
    },
    "cybersecurity certification": {
        url:      `https://certdb.cyberpath-hq.com/`,
        internal: false,
        title:    `CertDb - Cybersecurity Certification Database`,
    },
    "career paths": {
        url:      `https://certdb.cyberpath-hq.com/career-paths`,
        internal: false,
        title:    `Explore Cybersecurity Career Paths`,
    },
    "career path": {
        url:      `https://certdb.cyberpath-hq.com/career-paths`,
        internal: false,
        title:    `Explore Cybersecurity Career Paths`,
    },
    Orbis: {
        url:      `https://orbis.cyberpath-hq.com/`,
        internal: false,
        title:    `Orbis - Plugin-Driven Desktop Platform`,
    },
    "orbis platform": {
        url:      `https://orbis.cyberpath-hq.com/`,
        internal: false,
        title:    `Orbis - Plugin-Driven Desktop Platform`,
    },
    "orbis documentation": {
        url:      `https://orbis.cyberpath-hq.com/docs`,
        internal: false,
        title:    `Orbis Documentation`,
    },
    "orbis docs": {
        url:      `https://orbis.cyberpath-hq.com/docs`,
        internal: false,
        title:    `Orbis Documentation`,
    },
    "CyberPath blog": {
        url:      `/blog`,
        internal: true,
        title:    `CyberPath Blog - Cybersecurity Articles`,
    },
    "our blog": {
        url:      `/blog`,
        internal: true,
        title:    `CyberPath Blog`,
    },
    "CyberPath GitHub": {
        url:      `https://github.com/cyberpath-HQ`,
        internal: false,
        title:    `CyberPath on GitHub`,
    },
    "cyberpath-HQ": {
        url:      `https://github.com/cyberpath-HQ`,
        internal: false,
        title:    `CyberPath GitHub Organization`,
    },
    "Blue Team Specialist": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/blue-team-specialist`,
        internal: false,
        title:    `Blue Team Specialist Career Path`,
    },
    "blue team": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/blue-team-specialist`,
        internal: false,
        title:    `Blue Team Specialist Career Path`,
    },
    "Cloud Security Specialist": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/cloud-security-specialist`,
        internal: false,
        title:    `Cloud Security Specialist Career Path`,
    },
    "cloud security": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/cloud-security-specialist`,
        internal: false,
        title:    `Cloud Security Career Path`,
    },
    "Cybersecurity Manager": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/cybersecurity-manager`,
        internal: false,
        title:    `Cybersecurity Manager Career Path`,
    },
    "Malware Developer": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/malware-developer`,
        internal: false,
        title:    `Malware Developer Career Path`,
    },
    "OSINT Specialist": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/osint-specialist`,
        internal: false,
        title:    `OSINT Specialist Career Path`,
    },
    "Penetration Tester": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/penetration-tester`,
        internal: false,
        title:    `Penetration Tester Career Path`,
    },
    "penetration testing": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/penetration-tester`,
        internal: false,
        title:    `Penetration Testing Career Path`,
    },
    "Red Team Specialist": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/red-team-specialist`,
        internal: false,
        title:    `Red Team Specialist Career Path`,
    },
    "red team": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/red-team-specialist`,
        internal: false,
        title:    `Red Team Specialist Career Path`,
    },
    "Risk Management Specialist": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/risk-management-specialist`,
        internal: false,
        title:    `Risk Management Specialist Career Path`,
    },
    "Security Operations Specialist": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/security-operations-specialist`,
        internal: false,
        title:    `Security Operations Specialist Career Path`,
    },
    "security operations": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/security-operations-specialist`,
        internal: false,
        title:    `Security Operations Career Path`,
    },
    "Threat Hunter": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/threat-hunter`,
        internal: false,
        title:    `Threat Hunter Career Path`,
    },
    "threat hunting": {
        url:      `https://certdb.cyberpath-hq.com/career-paths/threat-hunter`,
        internal: false,
        title:    `Threat Hunting Career Path`,
    },
    "offensive security": {
        url:      `https://www.offsec.com/`,
        internal: false,
        title:    `Offensive Security - Training & Certifications`,
    },
    OffSec: {
        url:      `https://www.offsec.com/`,
        internal: false,
        title:    `Offensive Security`,
    },
    "Offensive Security": {
        url:      `https://www.offsec.com/`,
        internal: false,
        title:    `Offensive Security`,
    },
    OSCP: {
        url:      `https://www.offsec.com/courses/pen-200/`,
        internal: false,
        title:    `OSCP - Offensive Security Certified Professional`,
    },
    OSEP: {
        url:      `https://www.offsec.com/courses/pen-300/`,
        internal: false,
        title:    `OSEP - Offensive Security Experienced Penetration Tester`,
    },
    OSWE: {
        url:      `https://www.offsec.com/courses/web-300/`,
        internal: false,
        title:    `OSWE - Offensive Security Web Expert`,
    },
    OSED: {
        url:      `https://www.offsec.com/courses/exp-301/`,
        internal: false,
        title:    `OSED - Offensive Security Exploit Developer`,
    },
    OSWP: {
        url:      `https://www.offsec.com/courses/pen-210/`,
        internal: false,
        title:    `OSWP - Offensive Security Wireless Professional`,
    },
    OSCE3: {
        url:      `https://www.offsec.com/courses/osce3/`,
        internal: false,
        title:    `OSCE3 - Offensive Security Certified Expert 3`,
    },
    ISC2: {
        url:      `https://www.isc2.org/`,
        internal: false,
        title:    `ISC2 - Cybersecurity Certifications`,
    },
    "(ISC)²": {
        url:      `https://www.isc2.org/`,
        internal: false,
        title:    `(ISC)² - Cybersecurity Certifications`,
    },
    CISSP: {
        url:      `https://www.isc2.org/certifications/cissp`,
        internal: false,
        title:    `CISSP - Certified Information Systems Security Professional`,
    },
    CCSP: {
        url:      `https://www.isc2.org/certifications/ccsp`,
        internal: false,
        title:    `CCSP - Certified Cloud Security Professional`,
    },
    SSCP: {
        url:      `https://www.isc2.org/certifications/sscp`,
        internal: false,
        title:    `SSCP - Systems Security Certified Practitioner`,
    },
    CompTIA: {
        url:      `https://www.comptia.org/`,
        internal: false,
        title:    `CompTIA - IT Certifications`,
    },
    "CompTIA Security+": {
        url:      `https://www.comptia.org/certifications/security`,
        internal: false,
        title:    `CompTIA Security+ Certification`,
    },
    "Security+": {
        url:      `https://www.comptia.org/certifications/security`,
        internal: false,
        title:    `CompTIA Security+ Certification`,
    },
    "CompTIA CySA+": {
        url:      `https://www.comptia.org/certifications/cybersecurity-analyst`,
        internal: false,
        title:    `CompTIA CySA+ Certification`,
    },
    "CySA+": {
        url:      `https://www.comptia.org/certifications/cybersecurity-analyst`,
        internal: false,
        title:    `CompTIA CySA+ - Cybersecurity Analyst`,
    },
    "CompTIA PenTest+": {
        url:      `https://www.comptia.org/certifications/pentest`,
        internal: false,
        title:    `CompTIA PenTest+ Certification`,
    },
    "PenTest+": {
        url:      `https://www.comptia.org/certifications/pentest`,
        internal: false,
        title:    `CompTIA PenTest+ Certification`,
    },
    "CompTIA CASP+": {
        url:      `https://www.comptia.org/certifications/comptia-advanced-security-practitioner`,
        internal: false,
        title:    `CompTIA CASP+ Certification`,
    },
    "CASP+": {
        url:      `https://www.comptia.org/certifications/comptia-advanced-security-practitioner`,
        internal: false,
        title:    `CompTIA CASP+ - Advanced Security Practitioner`,
    },
    "CompTIA Network+": {
        url:      `https://www.comptia.org/certifications/network`,
        internal: false,
        title:    `CompTIA Network+ Certification`,
    },
    "Network+": {
        url:      `https://www.comptia.org/certifications/network`,
        internal: false,
        title:    `CompTIA Network+ Certification`,
    },
    "EC-Council": {
        url:      `https://www.eccouncil.org/`,
        internal: false,
        title:    `EC-Council - Cybersecurity Certifications`,
    },
    CEH: {
        url:      `https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/`,
        internal: false,
        title:    `CEH - Certified Ethical Hacker`,
    },
    "Certified Ethical Hacker": {
        url:      `https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/`,
        internal: false,
        title:    `Certified Ethical Hacker`,
    },
    CPENT: {
        url:      `https://www.eccouncil.org/programs/certified-penetration-testing-professional-cpent/`,
        internal: false,
        title:    `CPENT - Certified Penetration Testing Professional`,
    },
    CHFI: {
        url:      `https://www.eccouncil.org/programs/computer-hacking-forensic-investigator-chfi/`,
        internal: false,
        title:    `CHFI - Computer Hacking Forensic Investigator`,
    },
    GIAC: {
        url:      `https://www.giac.org/`,
        internal: false,
        title:    `GIAC - Global Information Assurance Certification`,
    },
    SANS: {
        url:      `https://www.sans.org/`,
        internal: false,
        title:    `SANS Institute - Cybersecurity Training`,
    },
    "SANS Institute": {
        url:      `https://www.sans.org/`,
        internal: false,
        title:    `SANS Institute - Cybersecurity Training`,
    },
    GSEC: {
        url:      `https://www.giac.org/certifications/security-essentials-gsec/`,
        internal: false,
        title:    `GSEC - GIAC Security Essentials`,
    },
    GCIH: {
        url:      `https://www.giac.org/certifications/certified-incident-handler-gcih/`,
        internal: false,
        title:    `GCIH - GIAC Certified Incident Handler`,
    },
    GPEN: {
        url:      `https://www.giac.org/certifications/penetration-tester-gpen/`,
        internal: false,
        title:    `GPEN - GIAC Penetration Tester`,
    },
    GWAPT: {
        url:      `https://www.giac.org/certifications/web-application-penetration-tester-gwapt/`,
        internal: false,
        title:    `GWAPT - GIAC Web Application Penetration Tester`,
    },
    GCFA: {
        url:      `https://www.giac.org/certifications/certified-forensic-analyst-gcfa/`,
        internal: false,
        title:    `GCFA - GIAC Certified Forensic Analyst`,
    },
    ISACA: {
        url:      `https://www.isaca.org/`,
        internal: false,
        title:    `ISACA - IT Governance & Security`,
    },
    CISM: {
        url:      `https://www.isaca.org/credentialing/cism`,
        internal: false,
        title:    `CISM - Certified Information Security Manager`,
    },
    CISA: {
        url:      `https://www.isaca.org/credentialing/cisa`,
        internal: false,
        title:    `CISA - Certified Information Systems Auditor`,
    },
    CRISC: {
        url:      `https://www.isaca.org/credentialing/crisc`,
        internal: false,
        title:    `CRISC - Certified in Risk and Information Systems Control`,
    },
    "MITRE ATT&CK": {
        url:      `https://attack.mitre.org/`,
        internal: false,
        title:    `MITRE ATT&CK Framework`,
    },
    "ATT&CK": {
        url:      `https://attack.mitre.org/`,
        internal: false,
        title:    `MITRE ATT&CK Framework`,
    },
    "Cyber Kill Chain": {
        url:      `https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html`,
        internal: false,
        title:    `Lockheed Martin Cyber Kill Chain`,
    },
    "kill chain": {
        url:      `https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html`,
        internal: false,
        title:    `Cyber Kill Chain`,
    },
    "Diamond Model": {
        url:      `https://www.threatintel.academy/diamond-model/`,
        internal: false,
        title:    `Diamond Model of Intrusion Analysis`,
    },
    STRIDE: {
        url:      `https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats`,
        internal: false,
        title:    `STRIDE Threat Modeling`,
    },
    CVE: {
        url:      `https://cve.mitre.org/`,
        internal: false,
        title:    `CVE - Common Vulnerabilities and Exposures`,
    },
    CVSS: {
        url:      `https://www.first.org/cvss/`,
        internal: false,
        title:    `CVSS - Common Vulnerability Scoring System`,
    },
    NVD: {
        url:      `https://nvd.nist.gov/`,
        internal: false,
        title:    `NVD - National Vulnerability Database`,
    },
    CWE: {
        url:      `https://cwe.mitre.org/`,
        internal: false,
        title:    `CWE - Common Weakness Enumeration`,
    },
    "zero-day": {
        url:      `https://en.wikipedia.org/wiki/Zero-day_(computing)`,
        internal: false,
        title:    `Zero-Day Vulnerability`,
    },
    "0-day": {
        url:      `https://en.wikipedia.org/wiki/Zero-day_(computing)`,
        internal: false,
        title:    `Zero-Day Vulnerability`,
    },
    APT: {
        url:      `https://attack.mitre.org/groups/`,
        internal: false,
        title:    `APT - Advanced Persistent Threat`,
    },
    "Advanced Persistent Threat": {
        url:      `https://attack.mitre.org/groups/`,
        internal: false,
        title:    `Advanced Persistent Threat Groups`,
    },
    OWASP: {
        url:      `https://owasp.org/`,
        internal: false,
        title:    `OWASP - Open Web Application Security Project`,
    },
    "OWASP Top 10": {
        url:      `https://owasp.org/www-project-top-ten/`,
        internal: false,
        title:    `OWASP Top 10 Web Application Security Risks`,
    },
    "OWASP Top Ten": {
        url:      `https://owasp.org/www-project-top-ten/`,
        internal: false,
        title:    `OWASP Top 10`,
    },
    "OWASP ZAP": {
        url:      `https://www.zaproxy.org/`,
        internal: false,
        title:    `OWASP ZAP - Zed Attack Proxy`,
    },
    "SQL injection": {
        url:      `https://owasp.org/www-community/attacks/SQL_Injection`,
        internal: false,
        title:    `SQL Injection Attack`,
    },
    SQLi: {
        url:      `https://owasp.org/www-community/attacks/SQL_Injection`,
        internal: false,
        title:    `SQL Injection`,
    },
    XSS: {
        url:      `https://owasp.org/www-community/attacks/xss/`,
        internal: false,
        title:    `Cross-Site Scripting (XSS)`,
    },
    "Cross-Site Scripting": {
        url:      `https://owasp.org/www-community/attacks/xss/`,
        internal: false,
        title:    `Cross-Site Scripting`,
    },
    CSRF: {
        url:      `https://owasp.org/www-community/attacks/csrf`,
        internal: false,
        title:    `Cross-Site Request Forgery (CSRF)`,
    },
    RCE: {
        url:      `https://en.wikipedia.org/wiki/Arbitrary_code_execution`,
        internal: false,
        title:    `Remote Code Execution`,
    },
    "buffer overflow": {
        url:      `https://owasp.org/www-community/vulnerabilities/Buffer_Overflow`,
        internal: false,
        title:    `Buffer Overflow Vulnerability`,
    },
    "privilege escalation": {
        url:      `https://attack.mitre.org/tactics/TA0004/`,
        internal: false,
        title:    `Privilege Escalation Techniques`,
    },
    "lateral movement": {
        url:      `https://attack.mitre.org/tactics/TA0008/`,
        internal: false,
        title:    `Lateral Movement Techniques`,
    },
    phishing: {
        url:      `https://attack.mitre.org/techniques/T1566/`,
        internal: false,
        title:    `Phishing Attacks`,
    },
    "spear phishing": {
        url:      `https://attack.mitre.org/techniques/T1566/001/`,
        internal: false,
        title:    `Spear Phishing Attacks`,
    },
    "social engineering": {
        url:      `https://attack.mitre.org/techniques/T1566/`,
        internal: false,
        title:    `Social Engineering Attacks`,
    },
    ransomware: {
        url:      `https://attack.mitre.org/software/`,
        internal: false,
        title:    `Ransomware`,
    },
    malware: {
        url:      `https://attack.mitre.org/software/`,
        internal: false,
        title:    `Malware`,
    },
    rootkit: {
        url:      `https://attack.mitre.org/techniques/T1014/`,
        internal: false,
        title:    `Rootkit`,
    },
    backdoor: {
        url:      `https://attack.mitre.org/techniques/T1547/`,
        internal: false,
        title:    `Backdoor Persistence`,
    },
    C2: {
        url:      `https://attack.mitre.org/tactics/TA0011/`,
        internal: false,
        title:    `Command and Control (C2)`,
    },
    DDoS: {
        url:      `https://attack.mitre.org/techniques/T0814/`,
        internal: false,
        title:    `Distributed Denial of Service`,
    },
    "man-in-the-middle": {
        url:      `https://attack.mitre.org/techniques/T1557/`,
        internal: false,
        title:    `Man-in-the-Middle Attack`,
    },
    MITM: {
        url:      `https://attack.mitre.org/techniques/T1557/`,
        internal: false,
        title:    `Man-in-the-Middle Attack`,
    },
    SSRF: {
        url:      `https://owasp.org/www-community/attacks/Server_Side_Request_Forgery`,
        internal: false,
        title:    `Server-Side Request Forgery`,
    },
    XXE: {
        url:      `https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing`,
        internal: false,
        title:    `XML External Entity Attack`,
    },
    IDOR: {
        url:      `https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References`,
        internal: false,
        title:    `Insecure Direct Object Reference`,
    },
    shellcode: {
        url:      `https://en.wikipedia.org/wiki/Shellcode`,
        internal: false,
        title:    `Shellcode`,
    },
    Metasploit: {
        url:      `https://www.metasploit.com/`,
        internal: false,
        title:    `Metasploit Framework`,
    },
    "Burp Suite": {
        url:      `https://portswigger.net/burp`,
        internal: false,
        title:    `Burp Suite - Web Security Testing`,
    },
    Nmap: {
        url:      `https://nmap.org/`,
        internal: false,
        title:    `Nmap - Network Scanner`,
    },
    Wireshark: {
        url:      `https://www.wireshark.org/`,
        internal: false,
        title:    `Wireshark - Network Protocol Analyzer`,
    },
    "Kali Linux": {
        url:      `https://www.kali.org/`,
        internal: false,
        title:    `Kali Linux - Penetration Testing Distribution`,
    },
    Kali: {
        url:      `https://www.kali.org/`,
        internal: false,
        title:    `Kali Linux`,
    },
    "Cobalt Strike": {
        url:      `https://www.cobaltstrike.com/`,
        internal: false,
        title:    `Cobalt Strike - Adversary Simulation`,
    },
    Nessus: {
        url:      `https://www.tenable.com/products/nessus`,
        internal: false,
        title:    `Nessus Vulnerability Scanner`,
    },
    OpenVAS: {
        url:      `https://www.openvas.org/`,
        internal: false,
        title:    `OpenVAS - Open Vulnerability Assessment Scanner`,
    },
    SQLMap: {
        url:      `https://sqlmap.org/`,
        internal: false,
        title:    `SQLMap - SQL Injection Tool`,
    },
    sqlmap: {
        url:      `https://sqlmap.org/`,
        internal: false,
        title:    `SQLMap - SQL Injection Tool`,
    },
    Hashcat: {
        url:      `https://hashcat.net/hashcat/`,
        internal: false,
        title:    `Hashcat - Password Recovery`,
    },
    "John the Ripper": {
        url:      `https://www.openwall.com/john/`,
        internal: false,
        title:    `John the Ripper Password Cracker`,
    },
    BloodHound: {
        url:      `https://github.com/BloodHoundAD/BloodHound`,
        internal: false,
        title:    `BloodHound - Active Directory Attack Path`,
    },
    Mimikatz: {
        url:      `https://github.com/gentilkiwi/mimikatz`,
        internal: false,
        title:    `Mimikatz - Credential Extraction`,
    },
    Impacket: {
        url:      `https://github.com/fortra/impacket`,
        internal: false,
        title:    `Impacket - Network Protocol Toolkit`,
    },
    Ghidra: {
        url:      `https://ghidra-sre.org/`,
        internal: false,
        title:    `Ghidra - Reverse Engineering Tool`,
    },
    "IDA Pro": {
        url:      `https://hex-rays.com/ida-pro/`,
        internal: false,
        title:    `IDA Pro - Disassembler`,
    },
    radare2: {
        url:      `https://rada.re/n/`,
        internal: false,
        title:    `radare2 - Reverse Engineering`,
    },
    Snort: {
        url:      `https://www.snort.org/`,
        internal: false,
        title:    `Snort - IDS/IPS`,
    },
    Suricata: {
        url:      `https://suricata.io/`,
        internal: false,
        title:    `Suricata - Network Threat Detection`,
    },
    Zeek: {
        url:      `https://zeek.org/`,
        internal: false,
        title:    `Zeek - Network Analysis Framework`,
    },
    Splunk: {
        url:      `https://www.splunk.com/`,
        internal: false,
        title:    `Splunk - SIEM`,
    },
    "Elastic Security": {
        url:      `https://www.elastic.co/security`,
        internal: false,
        title:    `Elastic Security`,
    },
    "ELK Stack": {
        url:      `https://www.elastic.co/elastic-stack`,
        internal: false,
        title:    `Elastic Stack (ELK)`,
    },
    Wazuh: {
        url:      `https://wazuh.com/`,
        internal: false,
        title:    `Wazuh - Security Platform`,
    },
    TryHackMe: {
        url:      `https://tryhackme.com/`,
        internal: false,
        title:    `TryHackMe - Cybersecurity Training`,
    },
    HackTheBox: {
        url:      `https://www.hackthebox.com/`,
        internal: false,
        title:    `Hack The Box - Cybersecurity Training`,
    },
    "Hack The Box": {
        url:      `https://www.hackthebox.com/`,
        internal: false,
        title:    `Hack The Box`,
    },
    HTB: {
        url:      `https://www.hackthebox.com/`,
        internal: false,
        title:    `Hack The Box`,
    },
    VulnHub: {
        url:      `https://www.vulnhub.com/`,
        internal: false,
        title:    `VulnHub - Vulnerable VMs`,
    },
    PentesterLab: {
        url:      `https://pentesterlab.com/`,
        internal: false,
        title:    `PentesterLab - Web Penetration Testing`,
    },
    "Web Security Academy": {
        url:      `https://portswigger.net/web-security`,
        internal: false,
        title:    `Web Security Academy`,
    },
    OverTheWire: {
        url:      `https://overthewire.org/wargames/`,
        internal: false,
        title:    `OverTheWire Wargames`,
    },
    CTFtime: {
        url:      `https://ctftime.org/`,
        internal: false,
        title:    `CTFtime - CTF Archive`,
    },
    SAST: {
        url:      `https://owasp.org/www-community/Source_Code_Analysis_Tools`,
        internal: false,
        title:    `SAST - Static Application Security Testing`,
    },
    DAST: {
        url:      `https://owasp.org/www-community/Vulnerability_Scanning_Tools`,
        internal: false,
        title:    `DAST - Dynamic Application Security Testing`,
    },
    SBOM: {
        url:      `https://www.cisa.gov/sbom`,
        internal: false,
        title:    `SBOM - Software Bill of Materials`,
    },
    DevSecOps: {
        url:      `https://www.devsecops.org/`,
        internal: false,
        title:    `DevSecOps - Security in DevOps`,
    },
    Snyk: {
        url:      `https://snyk.io/`,
        internal: false,
        title:    `Snyk - Developer Security Platform`,
    },
    SonarQube: {
        url:      `https://www.sonarsource.com/products/sonarqube/`,
        internal: false,
        title:    `SonarQube - Code Quality`,
    },
    Semgrep: {
        url:      `https://semgrep.dev/`,
        internal: false,
        title:    `Semgrep - Code Analysis`,
    },
    Trivy: {
        url:      `https://trivy.dev/`,
        internal: false,
        title:    `Trivy - Container Security Scanner`,
    },
    TLS: {
        url:      `https://en.wikipedia.org/wiki/Transport_Layer_Security`,
        internal: false,
        title:    `TLS - Transport Layer Security`,
    },
    HTTPS: {
        url:      `https://en.wikipedia.org/wiki/HTTPS`,
        internal: false,
        title:    `HTTPS - Secure HTTP`,
    },
    OAuth: {
        url:      `https://oauth.net/`,
        internal: false,
        title:    `OAuth - Authorization Framework`,
    },
    JWT: {
        url:      `https://jwt.io/`,
        internal: false,
        title:    `JWT - JSON Web Tokens`,
    },
    Kerberos: {
        url:      `https://web.mit.edu/kerberos/`,
        internal: false,
        title:    `Kerberos Authentication`,
    },
    "Active Directory": {
        url:      `https://docs.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview`,
        internal: false,
        title:    `Active Directory`,
    },
    MFA: {
        url:      `https://en.wikipedia.org/wiki/Multi-factor_authentication`,
        internal: false,
        title:    `MFA - Multi-Factor Authentication`,
    },
    "2FA": {
        url:      `https://en.wikipedia.org/wiki/Multi-factor_authentication`,
        internal: false,
        title:    `Two-Factor Authentication`,
    },
    PKI: {
        url:      `https://en.wikipedia.org/wiki/Public_key_infrastructure`,
        internal: false,
        title:    `PKI - Public Key Infrastructure`,
    },
    GDPR: {
        url:      `https://gdpr.eu/`,
        internal: false,
        title:    `GDPR - General Data Protection Regulation`,
    },
    HIPAA: {
        url:      `https://www.hhs.gov/hipaa/index.html`,
        internal: false,
        title:    `HIPAA - Health Insurance Portability and Accountability Act`,
    },
    "PCI DSS": {
        url:      `https://www.pcisecuritystandards.org/`,
        internal: false,
        title:    `PCI DSS - Payment Card Industry Data Security Standard`,
    },
    "SOC 2": {
        url:      `https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report`,
        internal: false,
        title:    `SOC 2 Compliance`,
    },
    "ISO 27001": {
        url:      `https://www.iso.org/isoiec-27001-information-security.html`,
        internal: false,
        title:    `ISO 27001 Information Security`,
    },
    NIST: {
        url:      `https://www.nist.gov/cybersecurity`,
        internal: false,
        title:    `NIST Cybersecurity`,
    },
    "NIST Cybersecurity Framework": {
        url:      `https://www.nist.gov/cyberframework`,
        internal: false,
        title:    `NIST Cybersecurity Framework`,
    },
    FedRAMP: {
        url:      `https://www.fedramp.gov/`,
        internal: false,
        title:    `FedRAMP`,
    },
    "CIS Controls": {
        url:      `https://www.cisecurity.org/controls`,
        internal: false,
        title:    `CIS Controls`,
    },
    IOC: {
        url:      `https://en.wikipedia.org/wiki/Indicator_of_compromise`,
        internal: false,
        title:    `IOC - Indicators of Compromise`,
    },
    STIX: {
        url:      `https://oasis-open.github.io/cti-documentation/stix/intro`,
        internal: false,
        title:    `STIX - Structured Threat Information Expression`,
    },
    TAXII: {
        url:      `https://oasis-open.github.io/cti-documentation/taxii/intro`,
        internal: false,
        title:    `TAXII - Trusted Automated Exchange of Intelligence Information`,
    },
    YARA: {
        url:      `https://yara.readthedocs.io/`,
        internal: false,
        title:    `YARA Rules`,
    },
    Sigma: {
        url:      `https://github.com/SigmaHQ/sigma`,
        internal: false,
        title:    `Sigma Detection Rules`,
    },
    MISP: {
        url:      `https://www.misp-project.org/`,
        internal: false,
        title:    `MISP - Malware Information Sharing Platform`,
    },
    VirusTotal: {
        url:      `https://www.virustotal.com/`,
        internal: false,
        title:    `VirusTotal`,
    },
    Shodan: {
        url:      `https://www.shodan.io/`,
        internal: false,
        title:    `Shodan - Search Engine for IoT`,
    },
    "incident response": {
        url:      `https://www.nist.gov/publications/computer-security-incident-handling-guide`,
        internal: false,
        title:    `Incident Response`,
    },
    DFIR: {
        url:      `https://www.sans.org/digital-forensics-incident-response/`,
        internal: false,
        title:    `DFIR - Digital Forensics and Incident Response`,
    },
    "digital forensics": {
        url:      `https://www.sans.org/digital-forensics-incident-response/`,
        internal: false,
        title:    `Digital Forensics`,
    },
    SOC: {
        url:      `https://en.wikipedia.org/wiki/Security_operations_center`,
        internal: false,
        title:    `SOC - Security Operations Center`,
    },
    "Security Operations Center": {
        url:      `https://en.wikipedia.org/wiki/Security_operations_center`,
        internal: false,
        title:    `Security Operations Center`,
    },
    "AWS Security": {
        url:      `https://aws.amazon.com/security/`,
        internal: false,
        title:    `AWS Security`,
    },
    "Azure Security": {
        url:      `https://azure.microsoft.com/en-us/explore/security`,
        internal: false,
        title:    `Azure Security`,
    },
    "GCP Security": {
        url:      `https://cloud.google.com/security`,
        internal: false,
        title:    `Google Cloud Security`,
    },
    "Kubernetes security": {
        url:      `https://kubernetes.io/docs/concepts/security/`,
        internal: false,
        title:    `Kubernetes Security`,
    },
    "container security": {
        url:      `https://kubernetes.io/docs/concepts/security/`,
        internal: false,
        title:    `Container Security`,
    },
    Falco: {
        url:      `https://falco.org/`,
        internal: false,
        title:    `Falco - Runtime Security`,
    },
    Rust: {
        url:      `https://www.rust-lang.org/`,
        internal: false,
        title:    `Rust Programming Language`,
    },
    Python: {
        url:      `https://www.python.org/`,
        internal: false,
        title:    `Python Programming Language`,
    },
    Go: {
        url:      `https://go.dev/`,
        internal: false,
        title:    `Go Programming Language`,
    },
    PowerShell: {
        url:      `https://docs.microsoft.com/en-us/powershell/`,
        internal: false,
        title:    `PowerShell`,
    },
    "secure coding": {
        url:      `https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/`,
        internal: false,
        title:    `OWASP Secure Coding Practices`,
    },
    "memory safety": {
        url:      `https://en.wikipedia.org/wiki/Memory_safety`,
        internal: false,
        title:    `Memory Safety`,
    },
};
