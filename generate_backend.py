import os

def create_scaffold():
    base_dir = "d:/Our Projects/DogProfileApp/backend/src"
    
    entities = [
        "User", "Dog", "Event", "Payment", "Certificate", "Upload", 
        "Group", "Breed", "Settings", "Dashboard", "Report", "Notification", "Support"
    ]
    
    for entity in entities:
        lower = entity.lower()
        
        # Create Repository
        repo_content = f"""import prisma from '../prisma';

export class {entity}Repository {{
    // Implement database queries here
}}
"""
        with open(os.path.join(base_dir, f"repositories/{lower}.repository.ts"), "w") as f:
            f.write(repo_content)
            
        # Create Service
        service_content = f"""import {{ {entity}Repository }} from '../repositories/{lower}.repository';

const repository = new {entity}Repository();

export class {entity}Service {{
    // Implement business logic here
}}
"""
        with open(os.path.join(base_dir, f"services/{lower}.service.ts"), "w") as f:
            f.write(service_content)

if __name__ == "__main__":
    create_scaffold()
    print("Backend scaffold generated successfully.")
