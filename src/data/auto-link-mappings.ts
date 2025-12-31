import { glob } from "glob";
import { readFile } from 'fs/promises';
import matter from "gray-matter";
import path from "path";

/**
 * Represents a link definition with URL and metadata
 */
export interface LinkDefinition {
    /** The URL to link to (internal: starts with '/', external: full URL) */
    url?: string

    /** Optional title attribute for the link */
    title?: string

    /** Whether the term matching should be case-sensitive (default: false) */
    caseSensitive?: boolean

    /** Whether to match whole words only (default: true) */
    wholeWord?: boolean

    /** Reference to another term to inherit its definition (avoids duplication) */
    aliasOf?: string
}

/**
 * Type for the link mappings record
 */
export type LinkMappings = Record<string, LinkDefinition>;

/**
 * Static link mappings for common cybersecurity terms and resources
 */
const STATIC_MAPPINGS: LinkMappings = {
    // CyberPath Properties
    "CyberPath - Cybersecurity Tools & Resources": {
        url:   `/`,
        title: `CyberPath - Cybersecurity Tools & Resources`,
    },
    Cyberpath: {
        aliasOf: `CyberPath - Cybersecurity Tools & Resources`,
    },
    CyberPath: {
        aliasOf: `CyberPath - Cybersecurity Tools & Resources`,
    },

    // CertDb
    "CertDb - Cybersecurity Certification Database": {
        url:   `https://certdb.cyberpath-hq.com/`,
        title: `CertDb - Cybersecurity Certification Database`,
    },
    CertDb: {
        aliasOf: `CertDb - Cybersecurity Certification Database`,
    },
    "certification database": {
        aliasOf: `CertDb - Cybersecurity Certification Database`,
    },
    "certifications database": {
        aliasOf: `CertDb - Cybersecurity Certification Database`,
    },
    "cybersecurity certifications": {
        aliasOf: `CertDb - Cybersecurity Certification Database`,
    },
    "cybersecurity certification": {
        aliasOf: `CertDb - Cybersecurity Certification Database`,
    },

    // Career Paths
    "Explore Cybersecurity Career Paths": {
        url:   `https://certdb.cyberpath-hq.com/career-paths`,
        title: `Explore Cybersecurity Career Paths`,
    },
    "career paths": {
        aliasOf: `Explore Cybersecurity Career Paths`,
    },
    "career path": {
        aliasOf: `Explore Cybersecurity Career Paths`,
    },

    // Orbis
    "Orbis - Plugin-Driven Desktop Platform": {
        url:   `https://orbis.cyberpath-hq.com/`,
        title: `Orbis - Plugin-Driven Desktop Platform`,
    },
    Orbis: {
        aliasOf: `Orbis - Plugin-Driven Desktop Platform`,
    },
    "orbis platform": {
        aliasOf: `Orbis - Plugin-Driven Desktop Platform`,
    },

    "Orbis Documentation": {
        url:   `https://orbis.cyberpath-hq.com/docs`,
        title: `Orbis Documentation`,
    },
    "orbis documentation": {
        aliasOf: `Orbis Documentation`,
    },
    "orbis docs": {
        aliasOf: `Orbis Documentation`,
    },

    // Blog
    "CyberPath Blog - Cybersecurity Articles": {
        url:   `/blog`,
        title: `CyberPath Blog - Cybersecurity Articles`,
    },
    "CyberPath blog": {
        aliasOf: `CyberPath Blog - Cybersecurity Articles`,
    },
    "our blog": {
        aliasOf: `CyberPath Blog - Cybersecurity Articles`,
    },

    // GitHub
    "CyberPath on GitHub": {
        url:   `https://github.com/cyberpath-HQ`,
        title: `CyberPath on GitHub`,
    },
    "CyberPath GitHub": {
        aliasOf: `CyberPath on GitHub`,
    },
    "cyberpath-HQ": {
        aliasOf: `CyberPath on GitHub`,
    },

    // Career Paths - Specific
    "Blue Team Specialist Career Path": {
        url:   `https://certdb.cyberpath-hq.com/career-paths/blue-team-specialist`,
        title: `Blue Team Specialist Career Path`,
    },
    "Blue Team Specialist": {
        aliasOf: `Blue Team Specialist Career Path`,
    },
    "blue team": {
        aliasOf: `Blue Team Specialist Career Path`,
    },

    "Cloud Security Specialist Career Path": {
        url:   `https://certdb.cyberpath-hq.com/career-paths/cloud-security-specialist`,
        title: `Cloud Security Specialist Career Path`,
    },
    "Cloud Security Specialist": {
        aliasOf: `Cloud Security Specialist Career Path`,
    },
    "cloud security": {
        aliasOf: `Cloud Security Specialist Career Path`,
    },

    "Cybersecurity Manager Career Path": {
        url:   `https://certdb.cyberpath-hq.com/career-paths/cybersecurity-manager`,
        title: `Cybersecurity Manager Career Path`,
    },
    "Cybersecurity Manager": {
        aliasOf: `Cybersecurity Manager Career Path`,
    },

    "Malware Developer Career Path": {
        url:   `https://certdb.cyberpath-hq.com/career-paths/malware-developer`,
        title: `Malware Developer Career Path`,
    },
    "Malware Developer": {
        aliasOf: `Malware Developer Career Path`,
    },

    "OSINT Specialist Career Path": {
        url:   `https://certdb.cyberpath-hq.com/career-paths/osint-specialist`,
        title: `OSINT Specialist Career Path`,
    },
    "OSINT Specialist": {
        aliasOf: `OSINT Specialist Career Path`,
    },

    "Penetration Tester Career Path": {
        url:   `https://certdb.cyberpath-hq.com/career-paths/penetration-tester`,
        title: `Penetration Tester Career Path`,
    },
    "Penetration Tester": {
        aliasOf: `Penetration Tester Career Path`,
    },
    "penetration testing": {
        aliasOf: `Penetration Tester Career Path`,
    },

    "Red Team Specialist Career Path": {
        url:   `https://certdb.cyberpath-hq.com/career-paths/red-team-specialist`,
        title: `Red Team Specialist Career Path`,
    },
    "Red Team Specialist": {
        aliasOf: `Red Team Specialist Career Path`,
    },
    "red team": {
        aliasOf: `Red Team Specialist Career Path`,
    },

    "Risk Management Specialist Career Path": {
        url:   `https://certdb.cyberpath-hq.com/career-paths/risk-management-specialist`,
        title: `Risk Management Specialist Career Path`,
    },
    "Risk Management Specialist": {
        aliasOf: `Risk Management Specialist Career Path`,
    },

    "Security Operations Specialist Career Path": {
        url:   `https://certdb.cyberpath-hq.com/career-paths/security-operations-specialist`,
        title: `Security Operations Specialist Career Path`,
    },
    "Security Operations Specialist": {
        aliasOf: `Security Operations Specialist Career Path`,
    },
    "security operations": {
        aliasOf: `Security Operations Specialist Career Path`,
    },

    "Threat Hunter Career Path": {
        url:   `https://certdb.cyberpath-hq.com/career-paths/threat-hunter`,
        title: `Threat Hunter Career Path`,
    },
    "Threat Hunter": {
        aliasOf: `Threat Hunter Career Path`,
    },
    "threat hunting": {
        aliasOf: `Threat Hunter Career Path`,
    },

    // Certifications & Training Organizations
    "Offensive Security": {
        url:   `https://www.offsec.com/`,
        title: `Offensive Security`,
    },
    "offensive security": {
        aliasOf: `Offensive Security`,
    },
    OffSec: {
        aliasOf: `Offensive Security`,
    },

    "OSCP - Offensive Security Certified Professional": {
        url:   `https://www.offsec.com/courses/pen-200/`,
        title: `OSCP - Offensive Security Certified Professional`,
    },
    OSCP: {
        aliasOf: `OSCP - Offensive Security Certified Professional`,
    },

    "OSEP - Offensive Security Experienced Penetration Tester": {
        url:   `https://www.offsec.com/courses/pen-300/`,
        title: `OSEP - Offensive Security Experienced Penetration Tester`,
    },
    OSEP: {
        aliasOf: `OSEP - Offensive Security Experienced Penetration Tester`,
    },

    "OSWE - Offensive Security Web Expert": {
        url:   `https://www.offsec.com/courses/web-300/`,
        title: `OSWE - Offensive Security Web Expert`,
    },
    OSWE: {
        aliasOf: `OSWE - Offensive Security Web Expert`,
    },

    "OSED - Offensive Security Exploit Developer": {
        url:   `https://www.offsec.com/courses/exp-301/`,
        title: `OSED - Offensive Security Exploit Developer`,
    },
    OSED: {
        aliasOf: `OSED - Offensive Security Exploit Developer`,
    },

    "OSWP - Offensive Security Wireless Professional": {
        url:   `https://www.offsec.com/courses/pen-210/`,
        title: `OSWP - Offensive Security Wireless Professional`,
    },
    OSWP: {
        aliasOf: `OSWP - Offensive Security Wireless Professional`,
    },

    "OSCE3 - Offensive Security Certified Expert 3": {
        url:   `https://www.offsec.com/courses/osce3/`,
        title: `OSCE3 - Offensive Security Certified Expert 3`,
    },
    OSCE3: {
        aliasOf: `OSCE3 - Offensive Security Certified Expert 3`,
    },

    "(ISC)² - Cybersecurity Certifications": {
        url:   `https://www.isc2.org/`,
        title: `(ISC)² - Cybersecurity Certifications`,
    },
    ISC2: {
        aliasOf: `(ISC)² - Cybersecurity Certifications`,
    },
    "(ISC)²": {
        aliasOf: `(ISC)² - Cybersecurity Certifications`,
    },

    "CISSP - Certified Information Systems Security Professional": {
        url:   `https://www.isc2.org/certifications/cissp`,
        title: `CISSP - Certified Information Systems Security Professional`,
    },
    CISSP: {
        aliasOf: `CISSP - Certified Information Systems Security Professional`,
    },

    "CCSP - Certified Cloud Security Professional": {
        url:   `https://www.isc2.org/certifications/ccsp`,
        title: `CCSP - Certified Cloud Security Professional`,
    },
    CCSP: {
        aliasOf: `CCSP - Certified Cloud Security Professional`,
    },

    "SSCP - Systems Security Certified Practitioner": {
        url:   `https://www.isc2.org/certifications/sscp`,
        title: `SSCP - Systems Security Certified Practitioner`,
    },
    SSCP: {
        aliasOf: `SSCP - Systems Security Certified Practitioner`,
    },

    "CompTIA - IT Certifications": {
        url:   `https://www.comptia.org/`,
        title: `CompTIA - IT Certifications`,
    },
    CompTIA: {
        aliasOf: `CompTIA - IT Certifications`,
    },

    "CompTIA Security+ Certification": {
        url:   `https://www.comptia.org/certifications/security`,
        title: `CompTIA Security+ Certification`,
    },
    "CompTIA Security+": {
        aliasOf: `CompTIA Security+ Certification`,
    },
    "Security+": {
        aliasOf: `CompTIA Security+ Certification`,
    },

    "CompTIA CySA+ - Cybersecurity Analyst": {
        url:   `https://www.comptia.org/certifications/cybersecurity-analyst`,
        title: `CompTIA CySA+ - Cybersecurity Analyst`,
    },
    "CompTIA CySA+": {
        aliasOf: `CompTIA CySA+ - Cybersecurity Analyst`,
    },
    "CySA+": {
        aliasOf: `CompTIA CySA+ - Cybersecurity Analyst`,
    },

    "CompTIA PenTest+ Certification": {
        url:   `https://www.comptia.org/certifications/pentest`,
        title: `CompTIA PenTest+ Certification`,
    },
    "CompTIA PenTest+": {
        aliasOf: `CompTIA PenTest+ Certification`,
    },
    "PenTest+": {
        aliasOf: `CompTIA PenTest+ Certification`,
    },

    "CompTIA CASP+ - Advanced Security Practitioner": {
        url:   `https://www.comptia.org/certifications/comptia-advanced-security-practitioner`,
        title: `CompTIA CASP+ - Advanced Security Practitioner`,
    },
    "CompTIA CASP+": {
        aliasOf: `CompTIA CASP+ - Advanced Security Practitioner`,
    },
    "CASP+": {
        aliasOf: `CompTIA CASP+ - Advanced Security Practitioner`,
    },

    "CompTIA Network+ Certification": {
        url:   `https://www.comptia.org/certifications/network`,
        title: `CompTIA Network+ Certification`,
    },
    "CompTIA Network+": {
        aliasOf: `CompTIA Network+ Certification`,
    },
    "Network+": {
        aliasOf: `CompTIA Network+ Certification`,
    },

    "EC-Council - Cybersecurity Certifications": {
        url:   `https://www.eccouncil.org/`,
        title: `EC-Council - Cybersecurity Certifications`,
    },
    "EC-Council": {
        aliasOf: `EC-Council - Cybersecurity Certifications`,
    },

    "CEH - Certified Ethical Hacker": {
        url:   `https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/`,
        title: `CEH - Certified Ethical Hacker`,
    },
    CEH: {
        aliasOf: `CEH - Certified Ethical Hacker`,
    },
    "Certified Ethical Hacker": {
        aliasOf: `CEH - Certified Ethical Hacker`,
    },

    "CPENT - Certified Penetration Testing Professional": {
        url:   `https://www.eccouncil.org/programs/certified-penetration-testing-professional-cpent/`,
        title: `CPENT - Certified Penetration Testing Professional`,
    },
    CPENT: {
        aliasOf: `CPENT - Certified Penetration Testing Professional`,
    },

    "CHFI - Computer Hacking Forensic Investigator": {
        url:   `https://www.eccouncil.org/programs/computer-hacking-forensic-investigator-chfi/`,
        title: `CHFI - Computer Hacking Forensic Investigator`,
    },
    CHFI: {
        aliasOf: `CHFI - Computer Hacking Forensic Investigator`,
    },

    "GIAC - Global Information Assurance Certification": {
        url:   `https://www.giac.org/`,
        title: `GIAC - Global Information Assurance Certification`,
    },
    GIAC: {
        aliasOf: `GIAC - Global Information Assurance Certification`,
    },

    "SANS Institute - Cybersecurity Training": {
        url:   `https://www.sans.org/`,
        title: `SANS Institute - Cybersecurity Training`,
    },
    SANS: {
        aliasOf: `SANS Institute - Cybersecurity Training`,
    },
    "SANS Institute": {
        aliasOf: `SANS Institute - Cybersecurity Training`,
    },

    "GSEC - GIAC Security Essentials": {
        url:   `https://www.giac.org/certifications/security-essentials-gsec/`,
        title: `GSEC - GIAC Security Essentials`,
    },
    GSEC: {
        aliasOf: `GSEC - GIAC Security Essentials`,
    },

    "GCIH - GIAC Certified Incident Handler": {
        url:   `https://www.giac.org/certifications/certified-incident-handler-gcih/`,
        title: `GCIH - GIAC Certified Incident Handler`,
    },
    GCIH: {
        aliasOf: `GCIH - GIAC Certified Incident Handler`,
    },

    "GPEN - GIAC Penetration Tester": {
        url:   `https://www.giac.org/certifications/penetration-tester-gpen/`,
        title: `GPEN - GIAC Penetration Tester`,
    },
    GPEN: {
        aliasOf: `GPEN - GIAC Penetration Tester`,
    },

    "GWAPT - GIAC Web Application Penetration Tester": {
        url:   `https://www.giac.org/certifications/web-application-penetration-tester-gwapt/`,
        title: `GWAPT - GIAC Web Application Penetration Tester`,
    },
    GWAPT: {
        aliasOf: `GWAPT - GIAC Web Application Penetration Tester`,
    },

    "GCFA - GIAC Certified Forensic Analyst": {
        url:   `https://www.giac.org/certifications/certified-forensic-analyst-gcfa/`,
        title: `GCFA - GIAC Certified Forensic Analyst`,
    },
    GCFA: {
        aliasOf: `GCFA - GIAC Certified Forensic Analyst`,
    },

    "ISACA - IT Governance & Security": {
        url:   `https://www.isaca.org/`,
        title: `ISACA - IT Governance & Security`,
    },
    ISACA: {
        aliasOf: `ISACA - IT Governance & Security`,
    },

    "CISM - Certified Information Security Manager": {
        url:   `https://www.isaca.org/credentialing/cism`,
        title: `CISM - Certified Information Security Manager`,
    },
    CISM: {
        aliasOf: `CISM - Certified Information Security Manager`,
    },

    "CISA - Certified Information Systems Auditor": {
        url:   `https://www.isaca.org/credentialing/cisa`,
        title: `CISA - Certified Information Systems Auditor`,
    },
    CISA: {
        aliasOf: `CISA - Certified Information Systems Auditor`,
    },

    "CRISC - Certified in Risk and Information Systems Control": {
        url:   `https://www.isaca.org/credentialing/crisc`,
        title: `CRISC - Certified in Risk and Information Systems Control`,
    },
    CRISC: {
        aliasOf: `CRISC - Certified in Risk and Information Systems Control`,
    },

    // Frameworks & Methodologies
    "MITRE ATT&CK Framework": {
        url:   `https://attack.mitre.org/`,
        title: `MITRE ATT&CK Framework`,
    },
    "MITRE ATT&CK": {
        aliasOf: `MITRE ATT&CK Framework`,
    },
    "ATT&CK": {
        aliasOf: `MITRE ATT&CK Framework`,
    },

    "Lockheed Martin Cyber Kill Chain": {
        url:   `https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html`,
        title: `Lockheed Martin Cyber Kill Chain`,
    },
    "Cyber Kill Chain": {
        aliasOf: `Lockheed Martin Cyber Kill Chain`,
    },
    "kill chain": {
        aliasOf: `Lockheed Martin Cyber Kill Chain`,
    },

    "Diamond Model of Intrusion Analysis": {
        url:   `https://www.threatintel.academy/diamond-model/`,
        title: `Diamond Model of Intrusion Analysis`,
    },
    "Diamond Model": {
        aliasOf: `Diamond Model of Intrusion Analysis`,
    },

    "STRIDE Threat Modeling": {
        url:   `https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats`,
        title: `STRIDE Threat Modeling`,
    },
    STRIDE: {
        aliasOf: `STRIDE Threat Modeling`,
    },

    // Vulnerability Databases
    "CVE - Common Vulnerabilities and Exposures": {
        url:   `https://cve.mitre.org/`,
        title: `CVE - Common Vulnerabilities and Exposures`,
    },
    CVE: {
        aliasOf: `CVE - Common Vulnerabilities and Exposures`,
    },

    "CVSS - Common Vulnerability Scoring System": {
        url:   `https://www.first.org/cvss/`,
        title: `CVSS - Common Vulnerability Scoring System`,
    },
    CVSS: {
        aliasOf: `CVSS - Common Vulnerability Scoring System`,
    },

    "NVD - National Vulnerability Database": {
        url:   `https://nvd.nist.gov/`,
        title: `NVD - National Vulnerability Database`,
    },
    NVD: {
        aliasOf: `NVD - National Vulnerability Database`,
    },

    "CWE - Common Weakness Enumeration": {
        url:   `https://cwe.mitre.org/`,
        title: `CWE - Common Weakness Enumeration`,
    },
    CWE: {
        aliasOf: `CWE - Common Weakness Enumeration`,
    },

    // Threats & Attack Types
    "Zero-Day Vulnerability": {
        url:   `https://en.wikipedia.org/wiki/Zero-day_(computing)`,
        title: `Zero-Day Vulnerability`,
    },
    "zero-day": {
        aliasOf: `Zero-Day Vulnerability`,
    },
    "0-day": {
        aliasOf: `Zero-Day Vulnerability`,
    },

    "Advanced Persistent Threat Groups": {
        url:   `https://attack.mitre.org/groups/`,
        title: `Advanced Persistent Threat Groups`,
    },
    APT: {
        aliasOf: `Advanced Persistent Threat Groups`,
    },
    "Advanced Persistent Threat": {
        aliasOf: `Advanced Persistent Threat Groups`,
    },

    // OWASP
    "OWASP - Open Web Application Security Project": {
        url:   `https://owasp.org/`,
        title: `OWASP - Open Web Application Security Project`,
    },
    OWASP: {
        aliasOf: `OWASP - Open Web Application Security Project`,
    },

    "OWASP Top 10 Web Application Security Risks": {
        url:   `https://owasp.org/www-project-top-ten/`,
        title: `OWASP Top 10 Web Application Security Risks`,
    },
    "OWASP Top 10": {
        aliasOf: `OWASP Top 10 Web Application Security Risks`,
    },
    "OWASP Top Ten": {
        aliasOf: `OWASP Top 10 Web Application Security Risks`,
    },

    "OWASP ZAP - Zed Attack Proxy": {
        url:   `https://www.zaproxy.org/`,
        title: `OWASP ZAP - Zed Attack Proxy`,
    },
    "OWASP ZAP": {
        aliasOf: `OWASP ZAP - Zed Attack Proxy`,
    },

    // Common Vulnerabilities
    "SQL Injection Attack": {
        url:   `https://owasp.org/www-community/attacks/SQL_Injection`,
        title: `SQL Injection Attack`,
    },
    "SQL injection": {
        aliasOf: `SQL Injection Attack`,
    },
    SQLi: {
        aliasOf: `SQL Injection Attack`,
    },

    "Cross-Site Scripting (XSS)": {
        url:   `https://owasp.org/www-community/attacks/xss/`,
        title: `Cross-Site Scripting (XSS)`,
    },
    XSS: {
        aliasOf: `Cross-Site Scripting (XSS)`,
    },
    "Cross-Site Scripting": {
        aliasOf: `Cross-Site Scripting (XSS)`,
    },

    "Cross-Site Request Forgery (CSRF)": {
        url:   `https://owasp.org/www-community/attacks/csrf`,
        title: `Cross-Site Request Forgery (CSRF)`,
    },
    CSRF: {
        aliasOf: `Cross-Site Request Forgery (CSRF)`,
    },

    "Remote Code Execution": {
        url:   `https://en.wikipedia.org/wiki/Arbitrary_code_execution`,
        title: `Remote Code Execution`,
    },
    RCE: {
        aliasOf: `Remote Code Execution`,
    },

    "Buffer Overflow Vulnerability": {
        url:   `https://owasp.org/www-community/vulnerabilities/Buffer_Overflow`,
        title: `Buffer Overflow Vulnerability`,
    },
    "buffer overflow": {
        aliasOf: `Buffer Overflow Vulnerability`,
    },

    "Privilege Escalation Techniques": {
        url:   `https://attack.mitre.org/tactics/TA0004/`,
        title: `Privilege Escalation Techniques`,
    },
    "privilege escalation": {
        aliasOf: `Privilege Escalation Techniques`,
    },

    "Lateral Movement Techniques": {
        url:   `https://attack.mitre.org/tactics/TA0008/`,
        title: `Lateral Movement Techniques`,
    },
    "lateral movement": {
        aliasOf: `Lateral Movement Techniques`,
    },

    "Phishing Attacks": {
        url:   `https://attack.mitre.org/techniques/T1566/`,
        title: `Phishing Attacks`,
    },
    phishing: {
        aliasOf: `Phishing Attacks`,
    },

    "Spear Phishing Attacks": {
        url:   `https://attack.mitre.org/techniques/T1566/001/`,
        title: `Spear Phishing Attacks`,
    },
    "spear phishing": {
        aliasOf: `Spear Phishing Attacks`,
    },

    "Social Engineering Attacks": {
        url:   `https://attack.mitre.org/techniques/T1566/`,
        title: `Social Engineering Attacks`,
    },
    "social engineering": {
        aliasOf: `Social Engineering Attacks`,
    },

    Ransomware: {
        url:   `https://attack.mitre.org/software/`,
        title: `Ransomware`,
    },
    ransomware: {
        aliasOf: `Ransomware`,
    },

    Malware: {
        url:   `https://attack.mitre.org/software/`,
        title: `Malware`,
    },
    malware: {
        aliasOf: `Malware`,
    },

    Rootkit: {
        url:   `https://attack.mitre.org/techniques/T1014/`,
        title: `Rootkit`,
    },
    rootkit: {
        aliasOf: `Rootkit`,
    },

    "Backdoor Persistence": {
        url:   `https://attack.mitre.org/techniques/T1547/`,
        title: `Backdoor Persistence`,
    },
    backdoor: {
        aliasOf: `Backdoor Persistence`,
    },

    "Command and Control (C2)": {
        url:   `https://attack.mitre.org/tactics/TA0011/`,
        title: `Command and Control (C2)`,
    },
    C2: {
        aliasOf: `Command and Control (C2)`,
    },

    "Distributed Denial of Service": {
        url:   `https://attack.mitre.org/techniques/T0814/`,
        title: `Distributed Denial of Service`,
    },
    DDoS: {
        aliasOf: `Distributed Denial of Service`,
    },

    "Man-in-the-Middle Attack": {
        url:   `https://attack.mitre.org/techniques/T1557/`,
        title: `Man-in-the-Middle Attack`,
    },
    "man-in-the-middle": {
        aliasOf: `Man-in-the-Middle Attack`,
    },
    MITM: {
        aliasOf: `Man-in-the-Middle Attack`,
    },

    "Server-Side Request Forgery": {
        url:   `https://owasp.org/www-community/attacks/Server_Side_Request_Forgery`,
        title: `Server-Side Request Forgery`,
    },
    SSRF: {
        aliasOf: `Server-Side Request Forgery`,
    },

    "XML External Entity Attack": {
        url:   `https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing`,
        title: `XML External Entity Attack`,
    },
    XXE: {
        aliasOf: `XML External Entity Attack`,
    },

    "Insecure Direct Object Reference": {
        url:   `https://owasp.org/www-project-web-security-testing-guide/latest/` +
               `4-Web_Application_Security_Testing/05-Authorization_Testing/` +
               `04-Testing_for_Insecure_Direct_Object_References`,
        title: `Insecure Direct Object Reference`,
    },
    IDOR: {
        aliasOf: `Insecure Direct Object Reference`,
    },

    Shellcode: {
        url:   `https://en.wikipedia.org/wiki/Shellcode`,
        title: `Shellcode`,
    },
    shellcode: {
        aliasOf: `Shellcode`,
    },

    // Security Tools
    "Metasploit Framework": {
        url:   `https://www.metasploit.com/`,
        title: `Metasploit Framework`,
    },
    Metasploit: {
        aliasOf: `Metasploit Framework`,
    },

    "Burp Suite - Web Security Testing": {
        url:   `https://portswigger.net/burp`,
        title: `Burp Suite - Web Security Testing`,
    },
    "Burp Suite": {
        aliasOf: `Burp Suite - Web Security Testing`,
    },

    "Nmap - Network Scanner": {
        url:   `https://nmap.org/`,
        title: `Nmap - Network Scanner`,
    },
    Nmap: {
        aliasOf: `Nmap - Network Scanner`,
    },

    "Wireshark - Network Protocol Analyzer": {
        url:   `https://www.wireshark.org/`,
        title: `Wireshark - Network Protocol Analyzer`,
    },
    Wireshark: {
        aliasOf: `Wireshark - Network Protocol Analyzer`,
    },

    "Kali Linux - Penetration Testing Distribution": {
        url:   `https://www.kali.org/`,
        title: `Kali Linux - Penetration Testing Distribution`,
    },
    "Kali Linux": {
        aliasOf: `Kali Linux - Penetration Testing Distribution`,
    },
    Kali: {
        aliasOf: `Kali Linux - Penetration Testing Distribution`,
    },

    "Cobalt Strike - Adversary Simulation": {
        url:   `https://www.cobaltstrike.com/`,
        title: `Cobalt Strike - Adversary Simulation`,
    },
    "Cobalt Strike": {
        aliasOf: `Cobalt Strike - Adversary Simulation`,
    },

    "Nessus Vulnerability Scanner": {
        url:   `https://www.tenable.com/products/nessus`,
        title: `Nessus Vulnerability Scanner`,
    },
    Nessus: {
        aliasOf: `Nessus Vulnerability Scanner`,
    },

    "OpenVAS - Open Vulnerability Assessment Scanner": {
        url:   `https://www.openvas.org/`,
        title: `OpenVAS - Open Vulnerability Assessment Scanner`,
    },
    OpenVAS: {
        aliasOf: `OpenVAS - Open Vulnerability Assessment Scanner`,
    },

    "SQLMap - SQL Injection Tool": {
        url:   `https://sqlmap.org/`,
        title: `SQLMap - SQL Injection Tool`,
    },
    SQLMap: {
        aliasOf: `SQLMap - SQL Injection Tool`,
    },
    sqlmap: {
        aliasOf: `SQLMap - SQL Injection Tool`,
    },

    "Hashcat - Password Recovery": {
        url:   `https://hashcat.net/hashcat/`,
        title: `Hashcat - Password Recovery`,
    },
    Hashcat: {
        aliasOf: `Hashcat - Password Recovery`,
    },

    "John the Ripper Password Cracker": {
        url:   `https://www.openwall.com/john/`,
        title: `John the Ripper Password Cracker`,
    },
    "John the Ripper": {
        aliasOf: `John the Ripper Password Cracker`,
    },

    "BloodHound - Active Directory Attack Path": {
        url:   `https://github.com/BloodHoundAD/BloodHound`,
        title: `BloodHound - Active Directory Attack Path`,
    },
    BloodHound: {
        aliasOf: `BloodHound - Active Directory Attack Path`,
    },

    "Mimikatz - Credential Extraction": {
        url:   `https://github.com/gentilkiwi/mimikatz`,
        title: `Mimikatz - Credential Extraction`,
    },
    Mimikatz: {
        aliasOf: `Mimikatz - Credential Extraction`,
    },

    "Impacket - Network Protocol Toolkit": {
        url:   `https://github.com/fortra/impacket`,
        title: `Impacket - Network Protocol Toolkit`,
    },
    Impacket: {
        aliasOf: `Impacket - Network Protocol Toolkit`,
    },

    "Ghidra - Reverse Engineering Tool": {
        url:   `https://ghidra-sre.org/`,
        title: `Ghidra - Reverse Engineering Tool`,
    },
    Ghidra: {
        aliasOf: `Ghidra - Reverse Engineering Tool`,
    },

    "IDA Pro - Disassembler": {
        url:   `https://hex-rays.com/ida-pro/`,
        title: `IDA Pro - Disassembler`,
    },
    "IDA Pro": {
        aliasOf: `IDA Pro - Disassembler`,
    },

    "radare2 - Reverse Engineering": {
        url:   `https://rada.re/n/`,
        title: `radare2 - Reverse Engineering`,
    },
    radare2: {
        aliasOf: `radare2 - Reverse Engineering`,
    },

    "Snort - IDS/IPS": {
        url:   `https://www.snort.org/`,
        title: `Snort - IDS/IPS`,
    },
    Snort: {
        aliasOf: `Snort - IDS/IPS`,
    },

    "Suricata - Network Threat Detection": {
        url:   `https://suricata.io/`,
        title: `Suricata - Network Threat Detection`,
    },
    Suricata: {
        aliasOf: `Suricata - Network Threat Detection`,
    },

    "Zeek - Network Analysis Framework": {
        url:   `https://zeek.org/`,
        title: `Zeek - Network Analysis Framework`,
    },
    Zeek: {
        aliasOf: `Zeek - Network Analysis Framework`,
    },

    "Splunk - SIEM": {
        url:   `https://www.splunk.com/`,
        title: `Splunk - SIEM`,
    },
    Splunk: {
        aliasOf: `Splunk - SIEM`,
    },

    "Elastic Security": {
        url:   `https://www.elastic.co/security`,
        title: `Elastic Security`,
    },

    "Elastic Stack (ELK)": {
        url:   `https://www.elastic.co/elastic-stack`,
        title: `Elastic Stack (ELK)`,
    },
    "ELK Stack": {
        aliasOf: `Elastic Stack (ELK)`,
    },

    "Wazuh - Security Platform": {
        url:   `https://wazuh.com/`,
        title: `Wazuh - Security Platform`,
    },
    Wazuh: {
        aliasOf: `Wazuh - Security Platform`,
    },

    // Training Platforms
    "TryHackMe - Cybersecurity Training": {
        url:   `https://tryhackme.com/`,
        title: `TryHackMe - Cybersecurity Training`,
    },
    TryHackMe: {
        aliasOf: `TryHackMe - Cybersecurity Training`,
    },

    "Hack The Box": {
        url:   `https://www.hackthebox.com/`,
        title: `Hack The Box`,
    },
    HackTheBox: {
        aliasOf: `Hack The Box`,
    },
    HTB: {
        aliasOf: `Hack The Box`,
    },

    "VulnHub - Vulnerable VMs": {
        url:   `https://www.vulnhub.com/`,
        title: `VulnHub - Vulnerable VMs`,
    },
    VulnHub: {
        aliasOf: `VulnHub - Vulnerable VMs`,
    },

    "PentesterLab - Web Penetration Testing": {
        url:   `https://pentesterlab.com/`,
        title: `PentesterLab - Web Penetration Testing`,
    },
    PentesterLab: {
        aliasOf: `PentesterLab - Web Penetration Testing`,
    },

    "Web Security Academy": {
        url:   `https://portswigger.net/web-security`,
        title: `Web Security Academy`,
    },

    "OverTheWire Wargames": {
        url:   `https://overthewire.org/wargames/`,
        title: `OverTheWire Wargames`,
    },
    OverTheWire: {
        aliasOf: `OverTheWire Wargames`,
    },

    "CTFtime - CTF Archive": {
        url:   `https://ctftime.org/`,
        title: `CTFtime - CTF Archive`,
    },
    CTFtime: {
        aliasOf: `CTFtime - CTF Archive`,
    },

    // Application Security
    "SAST - Static Application Security Testing": {
        url:   `https://owasp.org/www-community/Source_Code_Analysis_Tools`,
        title: `SAST - Static Application Security Testing`,
    },
    SAST: {
        aliasOf: `SAST - Static Application Security Testing`,
    },

    "DAST - Dynamic Application Security Testing": {
        url:   `https://owasp.org/www-community/Vulnerability_Scanning_Tools`,
        title: `DAST - Dynamic Application Security Testing`,
    },
    DAST: {
        aliasOf: `DAST - Dynamic Application Security Testing`,
    },

    "SBOM - Software Bill of Materials": {
        url:   `https://www.cisa.gov/sbom`,
        title: `SBOM - Software Bill of Materials`,
    },
    SBOM: {
        aliasOf: `SBOM - Software Bill of Materials`,
    },

    "DevSecOps - Security in DevOps": {
        url:   `https://www.devsecops.org/`,
        title: `DevSecOps - Security in DevOps`,
    },
    DevSecOps: {
        aliasOf: `DevSecOps - Security in DevOps`,
    },

    "Snyk - Developer Security Platform": {
        url:   `https://snyk.io/`,
        title: `Snyk - Developer Security Platform`,
    },
    Snyk: {
        aliasOf: `Snyk - Developer Security Platform`,
    },

    "SonarQube - Code Quality": {
        url:   `https://www.sonarsource.com/products/sonarqube/`,
        title: `SonarQube - Code Quality`,
    },
    SonarQube: {
        aliasOf: `SonarQube - Code Quality`,
    },

    "Semgrep - Code Analysis": {
        url:   `https://semgrep.dev/`,
        title: `Semgrep - Code Analysis`,
    },
    Semgrep: {
        aliasOf: `Semgrep - Code Analysis`,
    },

    "Trivy - Container Security Scanner": {
        url:   `https://trivy.dev/`,
        title: `Trivy - Container Security Scanner`,
    },
    Trivy: {
        aliasOf: `Trivy - Container Security Scanner`,
    },

    // Cryptography & Authentication
    "TLS - Transport Layer Security": {
        url:   `https://en.wikipedia.org/wiki/Transport_Layer_Security`,
        title: `TLS - Transport Layer Security`,
    },
    TLS: {
        aliasOf: `TLS - Transport Layer Security`,
    },

    "HTTPS - Secure HTTP": {
        url:   `https://en.wikipedia.org/wiki/HTTPS`,
        title: `HTTPS - Secure HTTP`,
    },
    HTTPS: {
        aliasOf: `HTTPS - Secure HTTP`,
    },

    "OAuth - Authorization Framework": {
        url:   `https://oauth.net/`,
        title: `OAuth - Authorization Framework`,
    },
    OAuth: {
        aliasOf: `OAuth - Authorization Framework`,
    },

    "JWT - JSON Web Tokens": {
        url:   `https://jwt.io/`,
        title: `JWT - JSON Web Tokens`,
    },
    JWT: {
        aliasOf: `JWT - JSON Web Tokens`,
    },

    "Kerberos Authentication": {
        url:   `https://web.mit.edu/kerberos/`,
        title: `Kerberos Authentication`,
    },
    Kerberos: {
        aliasOf: `Kerberos Authentication`,
    },

    "Active Directory": {
        url:   `https://docs.microsoft.com/en-us/windows-server/identity/ad-ds/` +
               `get-started/virtual-dc/active-directory-domain-services-overview`,
        title: `Active Directory`,
    },

    "MFA - Multi-Factor Authentication": {
        url:   `https://en.wikipedia.org/wiki/Multi-factor_authentication`,
        title: `MFA - Multi-Factor Authentication`,
    },
    MFA: {
        aliasOf: `MFA - Multi-Factor Authentication`,
    },

    "Two-Factor Authentication": {
        url:   `https://en.wikipedia.org/wiki/Multi-factor_authentication`,
        title: `Two-Factor Authentication`,
    },
    "2FA": {
        aliasOf: `Two-Factor Authentication`,
    },

    "PKI - Public Key Infrastructure": {
        url:   `https://en.wikipedia.org/wiki/Public_key_infrastructure`,
        title: `PKI - Public Key Infrastructure`,
    },
    PKI: {
        aliasOf: `PKI - Public Key Infrastructure`,
    },

    // Compliance & Standards
    "GDPR - General Data Protection Regulation": {
        url:   `https://gdpr.eu/`,
        title: `GDPR - General Data Protection Regulation`,
    },
    GDPR: {
        aliasOf: `GDPR - General Data Protection Regulation`,
    },

    "HIPAA - Health Insurance Portability and Accountability Act": {
        url:   `https://www.hhs.gov/hipaa/index.html`,
        title: `HIPAA - Health Insurance Portability and Accountability Act`,
    },
    HIPAA: {
        aliasOf: `HIPAA - Health Insurance Portability and Accountability Act`,
    },

    "PCI DSS - Payment Card Industry Data Security Standard": {
        url:   `https://www.pcisecuritystandards.org/`,
        title: `PCI DSS - Payment Card Industry Data Security Standard`,
    },
    "PCI DSS": {
        aliasOf: `PCI DSS - Payment Card Industry Data Security Standard`,
    },

    "SOC 2 Compliance": {
        url:   `https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report`,
        title: `SOC 2 Compliance`,
    },
    "SOC 2": {
        aliasOf: `SOC 2 Compliance`,
    },

    "ISO 27001 Information Security": {
        url:   `https://www.iso.org/isoiec-27001-information-security.html`,
        title: `ISO 27001 Information Security`,
    },
    "ISO 27001": {
        aliasOf: `ISO 27001 Information Security`,
    },

    "NIST Cybersecurity": {
        url:   `https://www.nist.gov/cybersecurity`,
        title: `NIST Cybersecurity`,
    },
    NIST: {
        aliasOf: `NIST Cybersecurity`,
    },

    "NIST Cybersecurity Framework": {
        url:   `https://www.nist.gov/cyberframework`,
        title: `NIST Cybersecurity Framework`,
    },

    FedRAMP: {
        url:   `https://www.fedramp.gov/`,
        title: `FedRAMP`,
    },

    "CIS Controls": {
        url:   `https://www.cisecurity.org/controls`,
        title: `CIS Controls`,
    },

    // Threat Intelligence
    "IOC - Indicators of Compromise": {
        url:   `https://en.wikipedia.org/wiki/Indicator_of_compromise`,
        title: `IOC - Indicators of Compromise`,
    },
    IOC: {
        aliasOf: `IOC - Indicators of Compromise`,
    },

    "STIX - Structured Threat Information Expression": {
        url:   `https://oasis-open.github.io/cti-documentation/stix/intro`,
        title: `STIX - Structured Threat Information Expression`,
    },
    STIX: {
        aliasOf: `STIX - Structured Threat Information Expression`,
    },

    "TAXII - Trusted Automated Exchange of Intelligence Information": {
        url:   `https://oasis-open.github.io/cti-documentation/taxii/intro`,
        title: `TAXII - Trusted Automated Exchange of Intelligence Information`,
    },
    TAXII: {
        aliasOf: `TAXII - Trusted Automated Exchange of Intelligence Information`,
    },

    "YARA Rules": {
        url:   `https://yara.readthedocs.io/`,
        title: `YARA Rules`,
    },
    YARA: {
        aliasOf: `YARA Rules`,
    },

    "Sigma Detection Rules": {
        url:   `https://github.com/SigmaHQ/sigma`,
        title: `Sigma Detection Rules`,
    },
    Sigma: {
        aliasOf: `Sigma Detection Rules`,
    },

    "MISP - Malware Information Sharing Platform": {
        url:   `https://www.misp-project.org/`,
        title: `MISP - Malware Information Sharing Platform`,
    },
    MISP: {
        aliasOf: `MISP - Malware Information Sharing Platform`,
    },

    VirusTotal: {
        url:   `https://www.virustotal.com/`,
        title: `VirusTotal`,
    },

    "Shodan - Search Engine for IoT": {
        url:   `https://www.shodan.io/`,
        title: `Shodan - Search Engine for IoT`,
    },
    Shodan: {
        aliasOf: `Shodan - Search Engine for IoT`,
    },

    // Incident Response & Forensics
    "Incident Response": {
        url:   `https://www.nist.gov/publications/computer-security-incident-handling-guide`,
        title: `Incident Response`,
    },
    "incident response": {
        aliasOf: `Incident Response`,
    },

    "DFIR - Digital Forensics and Incident Response": {
        url:   `https://www.sans.org/digital-forensics-incident-response/`,
        title: `DFIR - Digital Forensics and Incident Response`,
    },
    DFIR: {
        aliasOf: `DFIR - Digital Forensics and Incident Response`,
    },
    "digital forensics": {
        aliasOf: `DFIR - Digital Forensics and Incident Response`,
    },

    "SOC - Security Operations Center": {
        url:   `https://en.wikipedia.org/wiki/Security_operations_center`,
        title: `SOC - Security Operations Center`,
    },
    SOC: {
        aliasOf: `SOC - Security Operations Center`,
    },
    "Security Operations Center": {
        aliasOf: `SOC - Security Operations Center`,
    },

    // Cloud Security
    "AWS Security": {
        url:   `https://aws.amazon.com/security/`,
        title: `AWS Security`,
    },

    "Azure Security": {
        url:   `https://azure.microsoft.com/en-us/explore/security`,
        title: `Azure Security`,
    },

    "Google Cloud Security": {
        url:   `https://cloud.google.com/security`,
        title: `Google Cloud Security`,
    },
    "GCP Security": {
        aliasOf: `Google Cloud Security`,
    },

    "Kubernetes Security": {
        url:   `https://kubernetes.io/docs/concepts/security/`,
        title: `Kubernetes Security`,
    },
    "Kubernetes security": {
        aliasOf: `Kubernetes Security`,
    },

    "Container Security": {
        url:   `https://kubernetes.io/docs/concepts/security/`,
        title: `Container Security`,
    },
    "container security": {
        aliasOf: `Container Security`,
    },

    "Falco - Runtime Security": {
        url:   `https://falco.org/`,
        title: `Falco - Runtime Security`,
    },
    Falco: {
        aliasOf: `Falco - Runtime Security`,
    },

    // Programming Languages
    "Rust Programming Language": {
        url:   `https://www.rust-lang.org/`,
        title: `Rust Programming Language`,
    },
    Rust: {
        aliasOf: `Rust Programming Language`,
    },

    "Python Programming Language": {
        url:   `https://www.python.org/`,
        title: `Python Programming Language`,
    },
    Python: {
        aliasOf: `Python Programming Language`,
    },

    "Go Programming Language": {
        url:   `https://go.dev/`,
        title: `Go Programming Language`,
    },
    Go: {
        aliasOf: `Go Programming Language`,
    },

    PowerShell: {
        url:   `https://docs.microsoft.com/en-us/powershell/`,
        title: `PowerShell`,
    },

    // Secure Development
    "OWASP Secure Coding Practices": {
        url:   `https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/`,
        title: `OWASP Secure Coding Practices`,
    },
    "secure coding": {
        aliasOf: `OWASP Secure Coding Practices`,
    },

    "Memory Safety": {
        url:   `https://en.wikipedia.org/wiki/Memory_safety`,
        title: `Memory Safety`,
    },
    "memory safety": {
        aliasOf: `Memory Safety`,
    },

    // Practice Environments
    "OWASP WebGoat - Insecure Web Application for Learning": {
        url:   `https://owasp.org/www-project-webgoat/`,
        title: `OWASP WebGoat - Insecure Web Application for Learning`,
    },
    "OWASP WebGoat": {
        aliasOf: `OWASP WebGoat - Insecure Web Application for Learning`,
    },

    "DVWA - Damn Vulnerable Web Application": {
        url:   `https://github.com/digininja/DVWA`,
        title: `DVWA - Damn Vulnerable Web Application`,
    },
    DVWA: {
        aliasOf: `DVWA - Damn Vulnerable Web Application`,
    },

    "Metasploitable - Vulnerable VM for Metasploit Testing": {
        url:   `https://github.com/rapid7/metasploitable3`,
        title: `Metasploitable - Vulnerable VM for Metasploit Testing`,
    },
    Metasploitable: {
        aliasOf: `Metasploitable - Vulnerable VM for Metasploit Testing`,
    },
};

/**
 * Dynamically generate link mappings for all blog posts
 * Note: This function requires Astro runtime and should be called from .astro files
 */
export async function generateBlogMappings(): Promise<LinkMappings> {
    const first_char = 0;
    const char_after_first = 1;
    const min_slug_length = 10;

    try {
        // Dynamically import getCollection to avoid issues during config loading
        const files = await glob(`../content/blog/**/*.{md,mdx}`, {
            nodir: true,
            cwd:   import.meta.dirname,
        });
        console.log(`[auto-link] Found ${ files.length } blog post files for link mapping generation.`);
        const blogPosts = await Promise.all(
            files.map(
                async(file) => {
                    const file_path = path.normalize(path.join(import.meta.dirname, file));
                    const raw = await readFile(file_path, `utf-8`);
                    const {
                        data,
                    } = await matter(raw);
                    return {
                        frontmatter: {
                            ...data,
                            id: path.basename(file),
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } as Record<string, any>,
                    };
                }
            )
        );
        const mappings: LinkMappings = {};

        for (const post of blogPosts) {
            if (post.frontmatter.draft) {
                continue;
            }

            const url = `/blog/${ post.frontmatter.id.replace(/\.mdx?$/, ``) }`;
            const {
                title,
                linkHooks,
            } = post.frontmatter;

            // Add mapping with the exact title
            mappings[title] = {
                url,
                title,
            };

            // Add custom link hooks if provided
            if (linkHooks && Array.isArray(linkHooks)) {
                linkHooks
                    .filter((hook) => hook?.trim())
                    .forEach((hook) => {
                        mappings[hook] = {
                            aliasOf: title,
                        };
                    });
            }

            // Optionally add slug-based variations if they differ significantly
            const slug = post.frontmatter.id.replace(/\.mdx?$/, ``);
            const readableSlug = slug
                .split(`-`)
                .map((word: string) => word.charAt(first_char).toUpperCase() +
                                       word.slice(char_after_first))
                .join(` `);

            // Only add if it's different from the title and not too generic
            if (readableSlug !== title && readableSlug.length > min_slug_length) {
                mappings[readableSlug] = {
                    aliasOf: title,
                };
            }
        }

        console.log(`[auto-link] Generated ${ Object.keys(mappings).length } blog post link mappings for auto-linking.`);
        return mappings;
    }
    catch (error) {
        console.warn(`[auto-link] Failed to load blog posts for auto-linking:`, error);
        return {};
    }
}

/**
 * Combined link mappings (static + dynamic blog posts)
 * This should be called at build time to include all blog posts
 */
export async function getLinkMappings(): Promise<LinkMappings> {
    const blogMappings = await generateBlogMappings();
    return {
        ...STATIC_MAPPINGS,
        ...blogMappings,
    };
}

/**
 * Synchronous export for backwards compatibility
 * Note: This won't include blog post mappings. Use getLinkMappings() for full set.
 */
export const LINK_MAPPINGS = STATIC_MAPPINGS;
