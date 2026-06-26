"""Generate sample PDF resumes and job description files for testing."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from pathlib import Path

OUTPUT_DIR = Path("../samples/resumes")
JD_DIR = Path("../samples/job_descriptions")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
JD_DIR.mkdir(parents=True, exist_ok=True)

CANDIDATES = [
    {
        "name": "Ali Hassan",
        "email": "ali.hassan@email.com",
        "phone": "+92 300 1234567",
        "title": "Senior Full-Stack Developer",
        "summary": "Experienced full-stack developer with 6 years building scalable web applications using Python and JavaScript. Strong expertise in React, FastAPI, and cloud infrastructure.",
        "skills": ["Python", "FastAPI", "React", "Next.js", "PostgreSQL", "Docker", "AWS", "Redis", "TypeScript", "GraphQL", "Git", "CI/CD"],
        "experience": [
            {
                "company": "TechCorp Pakistan", "role": "Senior Software Engineer",
                "period": "2021 – Present", "duration": "3 years",
                "bullets": [
                    "Led development of microservices architecture serving 500K+ users",
                    "Reduced API response time by 40% through Redis caching",
                    "Mentored team of 4 junior developers",
                ]
            },
            {
                "company": "StartupHub", "role": "Full-Stack Developer",
                "period": "2019 – 2021", "duration": "2 years",
                "bullets": [
                    "Built e-commerce platform using React and Django REST Framework",
                    "Implemented CI/CD pipelines reducing deployment time by 60%",
                ]
            },
            {
                "company": "Freelance", "role": "Web Developer",
                "period": "2018 – 2019", "duration": "1 year",
                "bullets": ["Delivered 10+ client projects in React and Node.js"],
            },
        ],
        "education": [{"degree": "BS Computer Science", "institution": "LUMS", "year": "2018"}],
        "certifications": ["AWS Certified Developer – Associate", "Docker Certified Associate"],
        "projects": [
            {"name": "EduTrack", "desc": "Learning management system built with Next.js + FastAPI + PostgreSQL"},
            {"name": "PriceWatch", "desc": "E-commerce price comparison tool using Python scrapers and React dashboard"},
        ],
    },
    {
        "name": "Fatima Malik",
        "email": "fatima.malik@gmail.com",
        "phone": "+92 321 9876543",
        "title": "Machine Learning Engineer",
        "summary": "ML engineer with 4 years experience building production AI systems. Specialized in NLP, computer vision, and MLOps. Published 2 research papers on transformer architectures.",
        "skills": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Hugging Face", "LangChain", "FastAPI", "Docker", "Kubernetes", "SQL", "Pandas", "NumPy"],
        "experience": [
            {
                "company": "AI Labs Islamabad", "role": "ML Engineer",
                "period": "2022 – Present", "duration": "2 years",
                "bullets": [
                    "Developed NLP pipeline for Urdu language processing with 91% accuracy",
                    "Built and deployed 3 production ML models serving 100K+ daily predictions",
                ]
            },
            {
                "company": "DataSci Co.", "role": "Data Scientist",
                "period": "2020 – 2022", "duration": "2 years",
                "bullets": [
                    "Created customer churn prediction model improving retention by 25%",
                    "Automated ETL pipeline processing 10GB daily data",
                ]
            },
        ],
        "education": [{"degree": "MS Data Science", "institution": "NUST Islamabad", "year": "2020"}],
        "certifications": ["Google Professional ML Engineer", "TensorFlow Developer Certificate"],
        "projects": [
            {"name": "UrduNLP", "desc": "Open-source Urdu language processing library with 500+ GitHub stars"},
            {"name": "FaceGuard", "desc": "Real-time face recognition system using PyTorch and OpenCV"},
        ],
    },
    {
        "name": "Umar Farooq",
        "email": "umar.farooq@outlook.com",
        "phone": "+92 333 5551234",
        "title": "Frontend Developer",
        "summary": "Creative frontend developer with 2 years experience crafting responsive UIs. Passionate about user experience and modern JavaScript frameworks.",
        "skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML", "CSS", "JavaScript", "Figma", "Redux", "Jest"],
        "experience": [
            {
                "company": "PixelCraft Agency", "role": "Frontend Developer",
                "period": "2022 – Present", "duration": "2 years",
                "bullets": [
                    "Developed 15+ client websites using React and Next.js",
                    "Improved Core Web Vitals scores by 35% across client portfolio",
                    "Built reusable component library used across 5 projects",
                ]
            },
        ],
        "education": [{"degree": "BS Software Engineering", "institution": "UET Lahore", "year": "2022"}],
        "certifications": ["Meta Frontend Developer Certificate"],
        "projects": [
            {"name": "PortfolioKit", "desc": "Open-source portfolio template builder in Next.js with 200+ downloads"},
        ],
    },
    {
        "name": "Zara Ahmed",
        "email": "zara.ahmed@protonmail.com",
        "phone": "+92 345 7778890",
        "title": "DevOps Engineer",
        "summary": "DevOps engineer with 5 years automating infrastructure and streamlining deployment pipelines. Expert in Kubernetes, Terraform, and AWS cloud architecture.",
        "skills": ["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD", "Jenkins", "GitHub Actions", "Linux", "Python", "Ansible", "Prometheus", "Grafana"],
        "experience": [
            {
                "company": "CloudBase Solutions", "role": "Senior DevOps Engineer",
                "period": "2021 – Present", "duration": "3 years",
                "bullets": [
                    "Migrated monolithic app to Kubernetes reducing infra costs by 45%",
                    "Built zero-downtime deployment pipeline handling 200+ deployments/month",
                ]
            },
            {
                "company": "NetOps Ltd", "role": "DevOps Engineer",
                "period": "2019 – 2021", "duration": "2 years",
                "bullets": [
                    "Automated server provisioning using Terraform and Ansible",
                    "Set up monitoring stack (Prometheus + Grafana) for 50+ services",
                ]
            },
        ],
        "education": [{"degree": "BS Computer Engineering", "institution": "FAST Lahore", "year": "2019"}],
        "certifications": ["AWS Certified Solutions Architect – Professional", "Certified Kubernetes Administrator (CKA)"],
        "projects": [
            {"name": "K8s Autopilot", "desc": "Automated Kubernetes cluster scaling tool written in Go"},
        ],
    },
    {
        "name": "Hamza Iqbal",
        "email": "hamza.iqbal@gmail.com",
        "phone": "+92 311 2223334",
        "title": "Junior Backend Developer",
        "summary": "Motivated fresh graduate with strong foundations in Python and backend development. Completed 3 internships and built several projects during university.",
        "skills": ["Python", "Django", "SQL", "PostgreSQL", "REST APIs", "Git", "Linux", "HTML", "CSS"],
        "experience": [
            {
                "company": "SoftNation", "role": "Backend Developer Intern",
                "period": "Jun 2023 – Dec 2023", "duration": "6 months",
                "bullets": [
                    "Built REST APIs for mobile app backend using Django REST Framework",
                    "Optimized slow database queries reducing load time by 30%",
                ]
            },
        ],
        "education": [{"degree": "BS Computer Science", "institution": "COMSATS Lahore", "year": "2023"}],
        "certifications": ["Python Institute PCEP Certificate"],
        "projects": [
            {"name": "TaskMaster", "desc": "Task management API built with FastAPI and PostgreSQL"},
            {"name": "WeatherBot", "desc": "Telegram bot for weather updates using Python and OpenWeatherMap API"},
        ],
    },
]


def build_pdf(candidate: dict, output_path: Path):
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
    )

    styles = getSampleStyleSheet()
    accent = colors.HexColor("#1d4ed8")

    name_style = ParagraphStyle("name", fontSize=22, fontName="Helvetica-Bold",
                                 textColor=accent, spaceAfter=2)
    title_style = ParagraphStyle("title", fontSize=12, fontName="Helvetica",
                                  textColor=colors.HexColor("#374151"), spaceAfter=4)
    contact_style = ParagraphStyle("contact", fontSize=9, fontName="Helvetica",
                                    textColor=colors.HexColor("#6b7280"), spaceAfter=8)
    section_style = ParagraphStyle("section", fontSize=11, fontName="Helvetica-Bold",
                                    textColor=accent, spaceBefore=10, spaceAfter=4)
    body_style = ParagraphStyle("body", fontSize=9, fontName="Helvetica",
                                 leading=13, textColor=colors.HexColor("#111827"))
    bullet_style = ParagraphStyle("bullet", fontSize=9, fontName="Helvetica",
                                   leading=13, leftIndent=12,
                                   textColor=colors.HexColor("#374151"))
    company_style = ParagraphStyle("company", fontSize=10, fontName="Helvetica-Bold",
                                    textColor=colors.HexColor("#111827"), spaceAfter=1)
    role_style = ParagraphStyle("role", fontSize=9, fontName="Helvetica-Oblique",
                                 textColor=colors.HexColor("#6b7280"), spaceAfter=2)

    story = []

    story.append(Paragraph(candidate["name"], name_style))
    story.append(Paragraph(candidate["title"], title_style))
    story.append(Paragraph(
        f"{candidate['email']}  •  {candidate['phone']}",
        contact_style
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=accent))
    story.append(Spacer(1, 6))

    story.append(Paragraph("PROFESSIONAL SUMMARY", section_style))
    story.append(Paragraph(candidate["summary"], body_style))

    story.append(Paragraph("SKILLS", section_style))
    skills_text = "  •  ".join(candidate["skills"])
    story.append(Paragraph(skills_text, body_style))

    story.append(Paragraph("WORK EXPERIENCE", section_style))
    for exp in candidate["experience"]:
        story.append(Paragraph(f"{exp['company']} — {exp['period']}", company_style))
        story.append(Paragraph(exp["role"], role_style))
        for bullet in exp["bullets"]:
            story.append(Paragraph(f"• {bullet}", bullet_style))
        story.append(Spacer(1, 4))

    story.append(Paragraph("EDUCATION", section_style))
    for edu in candidate["education"]:
        story.append(Paragraph(
            f"{edu['degree']} — {edu['institution']} ({edu['year']})",
            body_style
        ))

    if candidate.get("certifications"):
        story.append(Paragraph("CERTIFICATIONS", section_style))
        for cert in candidate["certifications"]:
            story.append(Paragraph(f"• {cert}", bullet_style))

    if candidate.get("projects"):
        story.append(Paragraph("PROJECTS", section_style))
        for proj in candidate["projects"]:
            story.append(Paragraph(f"<b>{proj['name']}</b>: {proj['desc']}", body_style))
            story.append(Spacer(1, 2))

    doc.build(story)
    print(f"  Generated: {output_path.name}")


if __name__ == "__main__":
    print("Generating sample resumes...")
    for candidate in CANDIDATES:
        filename = candidate["name"].lower().replace(" ", "_") + "_resume.pdf"
        output_path = OUTPUT_DIR / filename
        build_pdf(candidate, output_path)

    print("\nGenerating job descriptions...")

    jd1 = """Senior Full-Stack Developer

We are looking for an experienced Senior Full-Stack Developer to join our engineering team.

Requirements:
- 4+ years of professional software development experience
- Strong proficiency in Python and JavaScript/TypeScript
- Experience with React or Next.js for frontend development
- Backend experience with FastAPI, Django, or similar frameworks
- Database experience with PostgreSQL or similar
- Experience with Docker and containerization
- Familiarity with AWS or other cloud platforms
- Understanding of CI/CD pipelines and DevOps practices

Preferred Qualifications:
- Experience with microservices architecture
- Knowledge of Redis, GraphQL
- Open source contributions
- Experience with Kubernetes

Education:
Bachelor's degree in Computer Science, Software Engineering, or equivalent

We offer competitive salary, remote work options, and a collaborative team environment."""

    jd2 = """Machine Learning Engineer

Join our AI team to build intelligent products that serve millions of users.

Requirements:
- 3+ years experience in machine learning or data science
- Proficiency in Python with ML frameworks (TensorFlow, PyTorch, or Scikit-learn)
- Experience with NLP or computer vision projects
- Familiarity with model deployment and MLOps
- Strong understanding of statistics and mathematics
- Experience with SQL and data pipelines

Preferred Qualifications:
- Experience with Hugging Face Transformers or LangChain
- Knowledge of LLM fine-tuning
- Published research papers
- Experience with Docker/Kubernetes for model deployment
- AWS or GCP experience

Education:
Master's degree in Computer Science, Data Science, or related field preferred.
Bachelor's with strong ML experience also considered."""

    (JD_DIR / "senior_full_stack_developer.txt").write_text(jd1)
    (JD_DIR / "machine_learning_engineer.txt").write_text(jd2)
    print("  Generated: senior_full_stack_developer.txt")
    print("  Generated: machine_learning_engineer.txt")
    print("\nDone!")
