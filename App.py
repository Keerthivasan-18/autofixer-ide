from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import shutil

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configuration
PROJECTS_DIR = "projects"
if not os.path.exists(PROJECTS_DIR):
    os.makedirs(PROJECTS_DIR)

# Helper Functions
def get_project_path(project_id):
    """Get the file system path for a project"""
    return os.path.join(PROJECTS_DIR, str(project_id))

def save_project_metadata(project_id, metadata):
    """Save project metadata to a JSON file"""
    project_path = get_project_path(project_id)
    metadata_path = os.path.join(project_path, "project.json")
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)

def load_project_metadata(project_id):
    """Load project metadata from JSON file"""
    project_path = get_project_path(project_id)
    metadata_path = os.path.join(project_path, "project.json")
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            return json.load(f)
    return None

# API Endpoints

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Get all projects"""
    try:
        projects = []
        if os.path.exists(PROJECTS_DIR):
            for project_id in os.listdir(PROJECTS_DIR):
                project_path = get_project_path(project_id)
                if os.path.isdir(project_path):
                    metadata = load_project_metadata(project_id)
                    if metadata:
                        projects.append(metadata)
        
        return jsonify({
            'success': True,
            'projects': projects
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects', methods=['POST'])
def create_project():
    """Create a new project"""
    try:
        data = request.json
        project_name = data.get('name')
        template = data.get('template', 'empty')
        
        if not project_name:
            return jsonify({
                'success': False,
                'error': 'Project name is required'
            }), 400
        
        # Generate unique project ID
        project_id = str(int(datetime.now().timestamp() * 1000))
        project_path = get_project_path(project_id)
        
        # Create project directory
        os.makedirs(project_path, exist_ok=True)
        
        # Create project structure based on template
        folders = ['src']
        files = []
        
        if template == 'basic':
            # Create basic Java structure
            src_path = os.path.join(project_path, 'src')
            os.makedirs(src_path, exist_ok=True)
            
            main_file = os.path.join(src_path, 'Main.java')
            with open(main_file, 'w') as f:
                f.write('')
            
            files.append({
                'name': 'Main.java',
                'path': 'src/Main.java',
                'content': '',
                'type': 'java'
            })
        
        elif template == 'maven':
            # Create Maven structure
            maven_dirs = ['src/main/java', 'src/test/java']
            for maven_dir in maven_dirs:
                os.makedirs(os.path.join(project_path, maven_dir), exist_ok=True)
            
            folders.extend(maven_dirs)
            
            # Create pom.xml
            pom_file = os.path.join(project_path, 'pom.xml')
            with open(pom_file, 'w') as f:
                f.write('')
            
            files.append({
                'name': 'pom.xml',
                'path': 'pom.xml',
                'content': '',
                'type': 'xml'
            })
        
        else:  # empty template
            src_path = os.path.join(project_path, 'src')
            os.makedirs(src_path, exist_ok=True)
        
        # Save project metadata
        metadata = {
            'id': project_id,
            'name': project_name,
            'template': template,
            'files': files,
            'folders': folders,
            'createdAt': datetime.now().isoformat()
        }
        
        save_project_metadata(project_id, metadata)
        
        return jsonify({
            'success': True,
            'project': metadata
        }), 201
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    """Get a specific project"""
    try:
        metadata = load_project_metadata(project_id)
        
        if not metadata:
            return jsonify({
                'success': False,
                'error': 'Project not found'
            }), 404
        
        return jsonify({
            'success': True,
            'project': metadata
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a project"""
    try:
        project_path = get_project_path(project_id)
        
        if not os.path.exists(project_path):
            return jsonify({
                'success': False,
                'error': 'Project not found'
            }), 404
        
        # Delete project directory
        shutil.rmtree(project_path)
        
        return jsonify({
            'success': True,
            'message': 'Project deleted successfully'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects/<project_id>/files', methods=['POST'])
def create_file(project_id):
    """Create a new file in a project"""
    try:
        data = request.json
        file_name = data.get('name')
        file_path = data.get('path')
        file_content = data.get('content', '')
        
        if not file_name or not file_path:
            return jsonify({
                'success': False,
                'error': 'File name and path are required'
            }), 400
        
        metadata = load_project_metadata(project_id)
        if not metadata:
            return jsonify({
                'success': False,
                'error': 'Project not found'
            }), 404
        
        # Create file on disk
        project_path = get_project_path(project_id)
        full_file_path = os.path.join(project_path, file_path)
        
        # Create parent directories if they don't exist
        os.makedirs(os.path.dirname(full_file_path), exist_ok=True)
        
        # Write file content
        with open(full_file_path, 'w') as f:
            f.write(file_content)
        
        # Update metadata
        file_info = {
            'name': file_name,
            'path': file_path,
            'content': file_content,
            'type': file_name.split('.')[-1] if '.' in file_name else 'txt'
        }
        
        metadata['files'].append(file_info)
        save_project_metadata(project_id, metadata)
        
        return jsonify({
            'success': True,
            'file': file_info
        }), 201
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects/<project_id>/files/<path:file_path>', methods=['GET'])
def get_file(project_id, file_path):
    """Get file content"""
    try:
        project_path = get_project_path(project_id)
        full_file_path = os.path.join(project_path, file_path)
        
        if not os.path.exists(full_file_path):
            return jsonify({
                'success': False,
                'error': 'File not found'
            }), 404
        
        with open(full_file_path, 'r') as f:
            content = f.read()
        
        return jsonify({
            'success': True,
            'content': content
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects/<project_id>/files/<path:file_path>', methods=['PUT'])
def update_file(project_id, file_path):
    """Update file content"""
    try:
        data = request.json
        content = data.get('content', '')
        
        project_path = get_project_path(project_id)
        full_file_path = os.path.join(project_path, file_path)
        
        if not os.path.exists(full_file_path):
            return jsonify({
                'success': False,
                'error': 'File not found'
            }), 404
        
        # Write updated content
        with open(full_file_path, 'w') as f:
            f.write(content)
        
        # Update metadata
        metadata = load_project_metadata(project_id)
        if metadata:
            for file_info in metadata['files']:
                if file_info['path'] == file_path:
                    file_info['content'] = content
                    break
            save_project_metadata(project_id, metadata)
        
        return jsonify({
            'success': True,
            'message': 'File updated successfully'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects/<project_id>/files/<path:file_path>', methods=['DELETE'])
def delete_file(project_id, file_path):
    """Delete a file"""
    try:
        project_path = get_project_path(project_id)
        full_file_path = os.path.join(project_path, file_path)
        
        if not os.path.exists(full_file_path):
            return jsonify({
                'success': False,
                'error': 'File not found'
            }), 404
        
        # Delete file from disk
        os.remove(full_file_path)
        
        # Update metadata
        metadata = load_project_metadata(project_id)
        if metadata:
            metadata['files'] = [f for f in metadata['files'] if f['path'] != file_path]
            save_project_metadata(project_id, metadata)
        
        return jsonify({
            'success': True,
            'message': 'File deleted successfully'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects/<project_id>/folders', methods=['POST'])
def create_folder(project_id):
    """Create a new folder in a project"""
    try:
        data = request.json
        folder_name = data.get('name')
        
        if not folder_name:
            return jsonify({
                'success': False,
                'error': 'Folder name is required'
            }), 400
        
        metadata = load_project_metadata(project_id)
        if not metadata:
            return jsonify({
                'success': False,
                'error': 'Project not found'
            }), 404
        
        # Create folder on disk
        project_path = get_project_path(project_id)
        folder_path = os.path.join(project_path, folder_name)
        os.makedirs(folder_path, exist_ok=True)
        
        # Update metadata
        if folder_name not in metadata['folders']:
            metadata['folders'].append(folder_name)
            save_project_metadata(project_id, metadata)
        
        return jsonify({
            'success': True,
            'folder': folder_name
        }), 201
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects/<project_id>/run', methods=['POST'])
def run_project(project_id):
    """Run/compile the project (placeholder for future implementation)"""
    try:
        metadata = load_project_metadata(project_id)
        if not metadata:
            return jsonify({
                'success': False,
                'error': 'Project not found'
            }), 404
        
        # This is a placeholder - actual compilation/execution would go here
        return jsonify({
            'success': True,
            'output': f'Running project: {metadata["name"]}...\nCompilation started...\n'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'AutoFixer IDE Backend is running',
        'timestamp': datetime.now().isoformat()
    }), 200

# Error Handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    print("Starting AutoFixer IDE Backend Server...")
    print(f"Projects directory: {os.path.abspath(PROJECTS_DIR)}")
    app.run(debug=True, host='0.0.0.0', port=5000)